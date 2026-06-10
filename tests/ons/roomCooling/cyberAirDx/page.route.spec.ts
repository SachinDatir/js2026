import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { generateLoginToken } from "../../../../support/api/auth-api";
import { defaultUser } from "../../../../test-data/auth-users";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
import { waitForApi } from "../../../../support/utils/wait-utils";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
import { CheckOAuthUserResponse } from "../../../../pages/auth/LoginPage";
import { InputPage } from "../../../../pages/ons/InputPage";
import { SavingPage } from "../../../../pages/ons/savingSharingPage";
const { email, password } = defaultUser;

test.describe("CyberAirDx Saving and Retrieval", () => {
  let loginTokenResponse: unknown;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputParameter: InputPage;
  let savingPage: SavingPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputParameter = new InputPage(page);
    savingPage = new SavingPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();

    loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test("route.fullfill method ", async ({ page }) => {
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd621A);
    });

    // const condenserListResponsePromise = waitForApi(page, "condenserList");
    // const condenserFormattedResponsePromise = waitForApi(
    //   page,
    //   "condenserFormatted",
    // );
    // const evaporatorExpertResponsePromise = waitForApi(
    //   page,
    //   "thestEvaporatorExpertCalculation",
    // );
    // const compressorExpertResponsePromise = waitForApi(
    //   page,
    //   "compressorExpertCalculation",
    // );

    await productConfigurationPage.proceed();

    await page.route("**/performAllCalculations", async (route) => {
      const response = await route.fetch();
      const responseBody = await response.json();
      expect(responseBody.message).toBe("Success");
      console.log("performAllCalculations API response:", responseBody);

      await route.fulfill({ response });
    });

    await page.waitForLoadState("domcontentloaded");

  });

  test("route. simulate error ", async ({ page }) => {
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd621A);
    });

    await page.route("**/performAllCalculations", async (route) => {
      const json = {
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server exploded" }),
      };

      await route.fulfill({ json });
    });
    await productConfigurationPage.proceed();

    // await page.waitForLoadState("domcontentloaded");

    await page.pause();
  });

  test("Show 'Session Expired' message on UI", async ({ page }) => {
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd621A);
    });
    // 1. Setup the Interception

    await page.route("**/performAllCalculations", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Session Expired" }),
      });
    });

    // 2. Trigger the action that calls the API
    await productConfigurationPage.proceed();

    // 3. Verify the UI reflects the mocked error
    // Replace the selector below with your app's actual error locator

    // await page.waitForTimeout(4000)
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });
});

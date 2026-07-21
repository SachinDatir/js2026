import { test, expect } from "@playwright/test";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../pages/ons/ProductConfigurationPage";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { ProductLinePage } from "../../../pages/ons/ProductLinePage";
import { defaultUser } from "../../../test-data/auth-users";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../support/utils/wait-utils";
import { splitAirModels } from "../../../test-data/ons-models";
import { InputPage } from "../../../pages/ons/InputPage";
import { ProfilePage } from "../../../pages/ons/profilePage";
const { email, password } = defaultUser;

test.describe("Verify the split Air mop functionality", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputPage: InputPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputPage = new InputPage(page);
    profilePage = new ProfilePage(page);

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
  });

  test("Verify the back navigation functionality", async ({ page }) => {
    const deuProductLine = dashboardPage.deuProductLine;
    const splitAir = dashboardPage.splitAirCard;
    await dashboardPage.selectShelterCooling();
    await dashboardPage.roomCoolingDeuProductLine.isVisible();
    await dashboardPage.selectProductLine(deuProductLine, splitAir);
    await dashboardPage.selectDischargeType("Inline, adjustable");
    await dashboardPage.selectCoolingSystem(" A+FC ");
    await dashboardPage.selectCompressorType(" On/Off ");
    await productConfigurationPage.selectModel(splitAirModels.SXG40F);

    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
      const thestEvaporatorExpertCalculation = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertCalculation = waitForApi(
        page,
        "compressorExpertCalculation",
      );

      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Data Fetched Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        splitAirModels.SXG40F,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });

    await test.step(" add new Operating point and verify", async () => {
      const thestEvaporatorExpertCalculation = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertCalculation = waitForApi(
        page,
        "compressorExpertCalculation",
      );

      const checkCalResponse = await submitAndWaitForResponse(
        () => inputPage.operatingPointButton.click(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Data Fetched Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        splitAirModels.SXG40F,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
      await page.getByRole("heading", { name: " OP 1 ", exact: true });
    });

    await profilePage.profileButton.click();
    await profilePage.profileTab.isVisible();
    await profilePage.profileTab.click({ force: true });
    await expect(page.locator("p.user-name").last()).toContainText(email);

    await page.goBack({ waitUntil: "domcontentloaded", timeout: 3000 });
    await page
      .getByRole("heading", { name: " OP 1 ", exact: true })
      .isVisible();
  });
});

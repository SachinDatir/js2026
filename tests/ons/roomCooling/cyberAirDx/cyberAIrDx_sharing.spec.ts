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
  let configName: string;
  let configurationData: {
    configName: string;
    configId?: any;
    originalValues?: any;
    updatedValues?: any;
  };
  let testData: {
    username: string;
    password: string;
    projectName: string;
    configToShare: string;

    newAirFlow: number;
    newExtStaticPressure: number;
  };
  test.beforeAll(() => {
    // Initialize Page Object and API Service

    // Load test data from environment variables
    testData = {
      username: process.env.EMAIL as string,
      password: process.env.PASSWORD as string,
      projectName: process.env.selectProjectSaving as string,
      configToShare: process.env.configToShare as string,

      newAirFlow: 2600,
      newExtStaticPressure: 21,
    };

    // Initialize configuration data
    configurationData = {
      configName: "Test" + (+Date.now() % 100000),
    };
  });
  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputParameter = new InputPage(page);
    savingPage = new SavingPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();

    // loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test("Verify sharing functionality for CyberAirDx model", async ({
    page,
  }) => {
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd582A);

      await page.route("**/performAllCalculations", async (route) => {
        const response = await route.fetch();
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Success");
        console.log("performAllCalculations API response:", responseBody);

        await route.fulfill({ response });
      });

      await page.route("**/condenserList", async (route) => {
        const response = await route.fetch();
        const responseBody = await response.json();

        console.log(responseBody);

        expect(responseBody.message).toBe("Success");

        await route.fulfill({ response });
      });

      await productConfigurationPage.proceed();

      await Promise.all([
        page.waitForResponse((resp) => resp.url().includes("condenserList")),

        savingPage.saveButton.click(),
      ]);

      await expect(
        page.getByRole("heading", { name: "Save Configuration" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Save Configuration" }),
      ).toContainText("Save Configuration");
      // 1. Fetch all project names from the dropdown
      // 1. Get the list of names (Scoped to your specific dropdown locator)
      const dropdownContainer = page.locator(savingPage.projectDropDown);

      await page.locator(".bxs-down-arrow").first().click({ force: true });
      const dropdownValues = await dropdownContainer
        .locator(".list-project")
        .allTextContents();

      const uniqueDropdowns = [...new Set(dropdownValues.map((t) => t.trim()))];

      const targetProject = "Saving project";

      for (const project of uniqueDropdowns) {
        if (project === targetProject) {
          console.log(`Match found! Clicking on: ${project}`);
          await dropdownContainer
            .getByText(project, { exact: true })
            .first()
            .click({ force: true });

          break;
        }
      }

      await page
        .getByRole("textbox", { name: "Configuration name" })
        .fill(configurationData.configName);

      const saveConfigResponse = await submitAndWaitForResponse(
        () => savingPage.saveButtonInModel.click(),
        page,
        "saveConfiguration",
      );

      expect(saveConfigResponse.status()).toBe(200);

      const shareBtn = savingPage.shareConfigButton;

      await expect(shareBtn).toBeVisible();
      await expect(shareBtn).toBeEnabled();

      await shareBtn.click();
      const textBox = page.getByRole("textbox", { name: "To: Name..." });

      await textBox.waitFor({ state: "visible" });
      await textBox.fill(testData.configToShare);
      await textBox.press("Enter");
      await page
        .locator(savingPage.suggestedUserList)
        .waitFor({ state: "visible" });
      await page.locator(savingPage.suggestedUserList).click({ force: true });
      await page.locator("#expiry").fill("2026-12-31");
      await page.route("**/shareConfiguration", async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response });
      });
      await savingPage.shareConfigModelButton.click({ force: true });
      await page.pause();
    });
  });
});

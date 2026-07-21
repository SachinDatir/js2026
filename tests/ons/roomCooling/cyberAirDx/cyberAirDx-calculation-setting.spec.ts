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

test.describe("CyberAirDx default configuration", () => {
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

    newAirFlow: string;
    newExtStaticPressure: number;
  };
  test.beforeAll(() => {
    // Initialize Page Object and API Service

    // Load test data from environment variables
    testData = {
      username: process.env.EMAIL as string,
      password: process.env.PASSWORD as string,
      projectName: process.env.selectProjectSaving as string,

      newAirFlow: "2600",
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
    configName = `Test${Date.now() % 100000}`;

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    // loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test.only("should open CyberAir DX model with default configuration", async ({
    page,
  }) => {
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd241A);
    });
    await test.step("Validate the performAllCalculations", async () => {
      let evaporatorExpertResponsePromise;
      let compressorExpertResponsePromise;
      const condenserListResponsePromise = waitForApi(page, "condenserList");
      const condenserFormattedResponsePromise = waitForApi(
        page,
        "condenserFormatted",
      );
      evaporatorExpertResponsePromise = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      compressorExpertResponsePromise = waitForApi(
        page,
        "compressorExpertCalculation",
      );
      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );
      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");
      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberAirDxModels.asd241A,
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);
      const requestBody = checkCalResponse.request().postDataJSON();
      const data = authResponseBody.data.outputData;
      const expertModeFanData = data.expertModeFan;
      const deuCoolingSystemFans = data.masterData.DeuCoolingSystemFans;
      await expect(requestBody).toBeDefined();

      await page.waitForLoadState("domcontentloaded");

      //evaporator
      const evaporatorSelector = page.locator(
        "[data-bs-target='#ThestEvaporatorStaticBackdrop']",
      );
      //compressor

      const compressorEl = page.locator(
        '[data-bs-target="#CompressorStaticBackdrop"]',
      );
      const refrigerentEl = page.locator("select#Refrigerant");
      const selectedOption = page.locator("select#Refrigerant option:checked");

      await page.getByTitle("Expert Calculation Tabs").click({ force: true });
      await page.waitForSelector(
        "[data-bs-target='#ThestEvaporatorStaticBackdrop']",
        { state: "visible" },
      );
      if (await evaporatorSelector.isVisible()) {
        await evaporatorSelector.click({ force: true });
      }
      await page
        .locator("#CompressorStaticBackdrop")
        .filter({ hasText: "Compressor calculation" })
        .isVisible();
      await page
        .getByRole("button", { name: "Calculate" })
        .click({ force: true });

      let thestOutput = await evaporatorExpertResponsePromise;
      const thestBody = await thestOutput.json();
      expect(thestBody).toHaveProperty("message", "Success");

      await page.getByRole("button", { name: "Close" }).click({ force: true });
      await expect(page.getByRole("button", { name: "Close" })).toBeHidden();
      await page.waitForTimeout(1000);
      await page
        .getByTitle("Expert Calculation Tabs").hover({ force: true })
       await page
        .getByTitle("Expert Calculation Tabs") .click({ force: true });
      await page.waitForSelector(
        '[data-bs-target="#CompressorStaticBackdrop"]',
        { state: "visible" },
      );
      await expect(compressorEl).toBeEnabled();
      if (await compressorEl.isVisible()) {
        await page.waitForTimeout(500);
        await compressorEl.click({ force: true });
      }

      await page.getByRole("button", { name: "Calculate" }).isVisible();
      await refrigerentEl.selectOption("R134a", { force: true });
      await expect(selectedOption).toHaveText(" R134a ");
      await page
        .getByRole("button", { name: "Calculate" })
        .click({ force: true });
      await compressorExpertResponsePromise;
      await page
        .locator(
          "#CompressorStaticBackdrop > .modal-dialog > .modal-content > .modal-header > .btn-close",
        )
        .click({ force: true });
    });
  });

  test("Verify setting functionality", async ({ page }) => {
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd241A);
    });

    await test.step("Validate the performAllCalculations", async () => {
      let evaporatorExpertResponsePromise;
      let compressorExpertResponsePromise;
      const condenserListResponsePromise = waitForApi(page, "condenserList");
      const condenserFormattedResponsePromise = waitForApi(
        page,
        "condenserFormatted",
      );
      evaporatorExpertResponsePromise = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      compressorExpertResponsePromise = waitForApi(
        page,
        "compressorExpertCalculation",
      );
      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );
      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");
      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberAirDxModels.asd241A,
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);
      const requestBody = checkCalResponse.request().postDataJSON();
      const data = authResponseBody.data.outputData;
      const expertModeFanData = data.expertModeFan;
      const deuCoolingSystemFans = data.masterData.DeuCoolingSystemFans;
      await expect(requestBody).toBeDefined();

      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("verify the setting", async () => {
      let newMinAirFlow: string = "3500";
      let newMaxAirFlow = 6500;
      let newRetAirTempMin = 15;
      let newRetAirTempMax = 35;
      let newPressureOffset = 10;
      await page.locator("a[title=Settings]").click({ force: true });

      await page.locator("si-us-formatter#inputVolumenstromMin input").click();
      await page
        .locator("si-us-formatter#inputVolumenstromMin input")
        .fill(testData.newAirFlow);
    });
  });
});

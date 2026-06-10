import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { defaultUser } from "../../../../test-data/auth-users";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { generateLoginToken, waitForApi } from "../../../../support/ons-helper";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
import {
  cyberAirMiniGeModels,
  cyberLabModels,
} from "../../../../test-data/ons-models";
import { InputPage } from "../../../../pages/ons/InputPage";
import { ProfilePage } from "../../../../pages/ons/profilePage";
import { siToUsConversion } from "../../../../support/utils/si-us-converter";
import { SettingPage } from "../../../../pages/ons/settingCal";
const { email, password } = defaultUser;
test.describe("CyberLab Room Cooling Test", () => {
  let loginTokenResponse: string | undefined;
  let settingsApiUrl: string | undefined;
  let settingsRequestBody: Record<string, unknown> | undefined;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let profilePage: ProfilePage;
  let inputPage: InputPage;
  let settingPage: SettingPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    profilePage = new ProfilePage(page);
    inputPage = new InputPage(page);
    settingPage = new SettingPage(page);
    settingsApiUrl = undefined;
    settingsRequestBody = undefined;
    // loginTokenResponse = await generateLoginToken(request, email, password);

    // Test implementation
    // console.log("Generated Login Token:", loginTokenResponse);
    await page.goto("http://localhost:4200/");
    await page.waitForURL("**/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");

    await dashboardPage.openRoomCooling();
    await dashboardPage.selectCyberAirMini();

    await productLinePage.selectCoolingSystem(" GE ");
  });

  test("Should verify the calculation settings when the user add the operating point", async ({
    page,
  }) => {
    await productConfigurationPage.selectModel(cyberAirMiniGeModels.CCD111GE);

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
        cyberAirMiniGeModels.CCD111GE,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("Add op and Validate the performAllCalculations after adding the Op point", async () => {
      const thestEvaporatorExpertCalculation = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertCalculation = waitForApi(
        page,
        "compressorExpertCalculation",
      );

      await inputPage.operatingPointButton.isVisible();
      await inputPage.operatingPointButton.isEnabled();

      const checkCalResponse = await submitAndWaitForResponse(
        () => inputPage.operatingPointButton.click(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Data Fetched Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberAirMiniGeModels.CCD81GE,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });
    await expect(settingPage.settingTab).toHaveCSS("pointer-events", "none");
    await expect(
      page.locator(".expert-tab-grey-disabled").first(),
    ).toHaveAttribute(
      "title",
      "Calculation settings cannot be customized with multiple operating points.",
    );
  });

  test("Validate the super setting functionality", async ({ page }) => {
    const newAirFlowMax = "4600";
    await productConfigurationPage.selectModel(cyberAirMiniGeModels.CCD81GE);
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
        cyberAirMiniGeModels.CCD81GE,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });
    await test.step("Validate the setting changes functionality", async () => {
      const thestEvaporatorExpertCalculation = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertCalculation = waitForApi(
        page,
        "compressorExpertCalculation",
      );
      await page.waitForLoadState("load");
      await settingPage.settingTab.dblclick({ force: true });
      await page.waitForTimeout(2000);
      await settingPage.input_Air_Flow_Max.isVisible();
      await inputPage.InputParameter(
        settingPage.input_Air_Flow_Max,
        newAirFlowMax,
      );
      await submitAndWaitForResponse(
        () => page.getByText("Recalculate").click({ force: true }),
        page,
        "userSettings",
      );
      await expect(inputPage.operatingPointButton).toHaveCSS(
        "pointer-events",
        "none",
      );

      await expect(inputPage.inputAirFlow.last()).toHaveAttribute(
        "max",
        newAirFlowMax,
      );

      await inputPage.InputParameter(inputPage.inputAirFlow, newAirFlowMax);
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;
    });
  });

  test("Validate the lphw functionality", async ({ page }) => {
    const newAirFlowMax = "4600";
    const thestEvaporatorExpertCalculation = waitForApi(
      page,
      "thestEvaporatorExpertCalculation",
    );
    const compressorExpertCalculation = waitForApi(
      page,
      "compressorExpertCalculation",
    );
    const calculateLphw = waitForApi(page, "calculateLphw");
    await productConfigurationPage.selectModel(cyberAirMiniGeModels.CCD81GE);
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
        cyberAirMiniGeModels.CCD81GE,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });
    //verify the lphw

    await expect(inputPage.lphwReheatButton).not.toHaveClass("active");
    await inputPage.lphwReheatButton.click();
    await calculateLphw;
    // await expect(inputPage.lphwReheatButton).toHaveClass("active");

    const checkCalResponse = await submitAndWaitForResponse(
      () => inputPage.operatingPointButton.click(),
      page,
      "performAllCalculations",
    );
    await checkCalResponse;
    await thestEvaporatorExpertCalculation;
    await compressorExpertCalculation;

    const checkCalResponseWinter = await submitAndWaitForResponse(
      () => page.locator("#operationMode2").click(),
      page,
      "performAllCalculations",
    );
    const authResponseBody = await checkCalResponseWinter.json();

    await page.waitForLoadState("domcontentloaded");

    let outPutData = authResponseBody.data?.outputData;
    let coolingCapacity =
      authResponseBody.data?.outputData?.unitOutput.coolingCapacity;
    let fanPowerW = outPutData.fan.totalPowerConsumption;

    // Convert Fan Watts to kW
    let fanPowerKw = fanPowerW;

    console.log(`fanPowerKw ${fanPowerKw} kW`);

    // Calculate Net Capacity
    let netTotalCoolingCapacity = coolingCapacity - fanPowerKw;
    console.log(netTotalCoolingCapacity, "netTotalCoolingCapacity");

    // Use a variable for the rounded expected value
    const expectedValue = Math.round(netTotalCoolingCapacity * 100) / 100;
    console.log(expectedValue, "expectedValue");

    const targetTable = page
      .locator(".scrolling-op", { hasText: /OP\s*1/ })
      .locator(".table");
    const tableCells = targetTable.locator("tbody tr td");
    const allTexts = await tableCells.allTextContents();
    allTexts[10];
    console.log(allTexts, "?????????????");
    expect(expectedValue.toFixed(1)).toBe(allTexts[10].trim());

    await page.pause();
    await expect(tableCells.last()).toHaveText(" - ");
    await inputPage.lphwReheatButton.click();
    await calculateLphw;
    await expect(tableCells.last()).not.toHaveText(" - ");
    const updatedText = await tableCells.last().textContent();
    console.log(`Updated Value: ${updatedText} ......`);
  });

  test("Selected inputs should get reset when user try to change the model selected inputs", async ({
    page,
  }) => {
    await productConfigurationPage.selectModel(cyberAirMiniGeModels.CCD81GE);
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
        cyberAirMiniGeModels.CCD81GE,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await thestEvaporatorExpertCalculation;
      await compressorExpertCalculation;

      await page.waitForLoadState("domcontentloaded");
    });

    const checkCalResponse = await submitAndWaitForResponse(
      () => inputPage.operatingPointButton.click(),
      page,
      "performAllCalculations",
    );
    await checkCalResponse;

    const checkCalRes = await submitAndWaitForResponse(
      () => inputPage.inputPowerSupply.selectOption("380V/50Hz/3Ph/N/PE"),
      page,
      "performAllCalculations",
    );
    await checkCalRes;
    await page.waitForLoadState("domcontentloaded");
    await expect( 
      page.locator(".scrolling-op", { hasText: /OP\s*1/ }),
    ).not.toBeVisible();

  });
});

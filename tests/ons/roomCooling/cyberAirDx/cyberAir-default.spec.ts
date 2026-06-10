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
    configName = `Test${Date.now() % 100000}`;

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    // loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test("should open CyberAir DX model with default configuration", async ({
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
      const condenserListResponsePromise = waitForApi(page, "condenserList");
      const condenserFormattedResponsePromise = waitForApi(
        page,
        "condenserFormatted",
      );
      const evaporatorExpertResponsePromise = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertResponsePromise = waitForApi(
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

      const fanPowerConsumptionFromAPI =
        (expertModeFanData.powerInputBp * deuCoolingSystemFans[0].noOfFans) /
        1000;

      const netTotalCoolingCapacity =
        data.unitOutput.coolingCapacity - fanPowerConsumptionFromAPI;

      console.log(
        "Fan Power Consumption from API:",
        fanPowerConsumptionFromAPI,
      );
      console.log(
        "Net Total Cooling Capacity from API:",
        netTotalCoolingCapacity,
      );

      await page
        .locator('[for="netTotalCoolingCapacity"]')
        .last()
        .textContent()
        .then((text) => {
          let str: any = text?.trim()?.split(" ")[0];
          const netCoolingCapacityFromUI = parseInt(str);
          console.log(
            "Net Total Cooling Capacity from UI:",
            netCoolingCapacityFromUI,
          );
          console.log(">>>>>>>>>>>>>");

          expect(Math.round(netTotalCoolingCapacity * 10) / 10).toBeCloseTo(
            netCoolingCapacityFromUI,
          );
        });

      const dxData = data.dxConvergence;
      let c1TotalCapacity = 0;
      let c2TotalCapacity = 0;
      let c1Pel = 0;
      let c2Pel = 0;
      let invertor = 0;

      if (data.masterData.isPowerConverterRequired) {
        if (
          requestBody.operatingConditions.compressorSpeed >
          requestBody.operatingConditions.refrigerant.circuit1.DeuCompressor
            .minSpeedInverter
        ) {
          invertor =
            (requestBody.operatingConditions.compressorSpeed -
              requestBody.operatingConditions.refrigerant.circuit1.DeuCompressor
                .minSpeedInverter) *
            requestBody.operatingConditions.refrigerant.circuit1.DeuCompressor
              .coefficientInverter;
        }
      }

      if (dxData.convergenceCircuit1) {
        c1TotalCapacity =
          data.dxConvergence.convergenceCircuit1.optimalEvaporatingPoint
            .capacityTotalKw;
        c1Pel = data.compressor.circuit1.electricalPowerConsp;
      }
      if (dxData.convergenceCircuit2) {
        c2TotalCapacity =
          data.dxConvergence.convergenceCircuit2.optimalEvaporatingPoint
            .capacityTotalKw;
        c2Pel = data.compressor.circuit2.electricalPowerConsp;
      }

      // await page.pause();
      //cooling capacity sensible
      const totalCoolingCapacity = c1TotalCapacity + c2TotalCapacity;

      const sensibleCoolingCapacity = data.unitOutput.sensibleCoolingCapacity;

      const netSensibleCoolingCapacity =
        data.unitOutput.sensibleCoolingCapacity - fanPowerConsumptionFromAPI;

      const eer =
        data.unitOutput.coolingCapacity / data.unitOutput.totalPowerConsumption;

      //COP
      let COP =
        data.unitOutput.coolingCapacity /
        data.compressor.circuit1.electricalPowerConsp;

      const numOfCompressors =
        requestBody.operatingConditions.refrigerant.circuit1.noOfCompressors;
      console.log("Number of Compressors:", numOfCompressors);

      let totalPowerConsumption =
        c1Pel *
          requestBody.operatingConditions.refrigerant.circuit1.noOfCompressors +
        (c2Pel *
          requestBody.operatingConditions.refrigerant.circuit2
            ?.noOfCompressors || 0) +
        Number(data.fan.powerConsumption.toFixed(1)) +
        invertor +
        Number((data.condensorFan?.powerConsumption || 0).toFixed(1));

      console.log("Total Power Consumption:", totalPowerConsumption);

      await page
        .locator('[for="coolingCapacity"]')
        .last()
        .textContent()
        .then((coolCap: any) => {
          const coolingCapacityValueFromUI = Number(
            coolCap.replace(/[^0-9.]/g, ""),
          );
          expect(coolingCapacityValueFromUI).toBeCloseTo(
            Math.round(totalCoolingCapacity * 10) / 10,
          );
        });

      await page
        .locator('[for="sensibleCoolingCapacity"]')
        .last()
        .textContent()
        .then((coolingCapacityText: any) => {
          const sensibleCoolingCapacityValueFromUI = Number(
            coolingCapacityText.replace(/[^0-9.]/g, ""),
          );
          expect(sensibleCoolingCapacityValueFromUI).toBeCloseTo(
            Math.round(sensibleCoolingCapacity * 10) / 10,
          );
        });

      console.log(
        Math.round(sensibleCoolingCapacity * 10) / 10,
        ">>>>???????????",
      );

      //netSensibleCoolingCapacity validation
      await page
        .locator('[for="netSensibleCoolingCapacity"]')
        .last()
        .textContent()
        .then((netSensibleCoolingCapacityText: any) => {
          const netSensibleCoolingCapacityValueFromUI = Number(
            netSensibleCoolingCapacityText.replace(/[^0-9.]/g, ""),
          );
          expect(netSensibleCoolingCapacityValueFromUI).toBeCloseTo(
            Math.round(netSensibleCoolingCapacity * 10) / 10,
          );
        });
    });
    await test.step("validate the Saving functionality", async () => {
      const condenserListResponsePromise = waitForApi(page, "condenserList");
      const condenserFormattedResponsePromise = waitForApi(
        page,
        "condenserFormatted",
      );
      const evaporatorExpertResponsePromise = waitForApi(
        page,
        "thestEvaporatorExpertCalculation",
      );
      const compressorExpertResponsePromise = waitForApi(
        page,
        "compressorExpertCalculation",
      );
      const saveConfigApi = waitForApi(page, "saveConfiguration");
      const configModel = savingPage.saveConfigModel;
      await savingPage.saveButton.click({ force: true });
      await configModel.first().waitFor({ state: "visible" });
      await expect(savingPage.saveConfigModel.first()).toBeVisible();
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
            .first() // Adds an extra layer of safety
            .click({ force: true });

          break;
        }
      }

      await page
        .getByRole("textbox", { name: "Configuration name" })
        .fill(configName);

      const performCal = waitForApi(page, "performAllCalculations");
      const checkCalResponse = await submitAndWaitForResponse(
        () => page.getByRole("button", { name: "Save" }).click({ force: true }),
        page,
        "saveConfiguration",
      );

      await expect(checkCalResponse.json()).toBeDefined();
      await performCal;
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);
      await page.pause();
    });
  });
});

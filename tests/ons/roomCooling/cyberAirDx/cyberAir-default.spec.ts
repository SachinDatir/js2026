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
const { email, password } = defaultUser;

test.describe("CyberAirDx default configuration", () => {
  let loginTokenResponse: unknown;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputParameter: InputPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputParameter = new InputPage(page);

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

    const data = authResponseBody.data.outputData;
    const expertModeFanData = data.expertModeFan;
    const deuCoolingSystemFans = data.masterData.DeuCoolingSystemFans;

    const fanPowerConsumptionFromAPI =
      (expertModeFanData.powerInputBp * deuCoolingSystemFans[0].noOfFans) /
      1000;

    const netTotalCoolingCapacity =
      data.unitOutput.coolingCapacity - fanPowerConsumptionFromAPI;

    console.log("Fan Power Consumption from API:", fanPowerConsumptionFromAPI);
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
    // await page.pause();
  });
});

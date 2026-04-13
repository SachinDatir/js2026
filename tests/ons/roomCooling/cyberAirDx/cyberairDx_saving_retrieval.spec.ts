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

test.describe("CyberAirDx Saving and Retrieval",  () => {
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

    loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test("should generate login token and open CyberAir DX model", async ({
    page,
  }) => {
    expect(loginTokenResponse).toBeTruthy();

    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();

    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd211A);
    });

    await test.step("proceed to model configuration and verify selection", async () => {
      const performCalResponsePromise = waitForApi(
        page,
        "performAllCalculations",
      );
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
        cyberAirDxModels.asd211A,
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      const inputProductLineCount =
        await inputParameter.inputProductLine.count();
      expect(inputProductLineCount).toBeGreaterThan(0);

      expect(await inputParameter.inputProductLine.allTextContents()).toEqual([
        " CyberAir  MiniSpace  CyberLab  CyberAir Mini ",
      ]);

      await inputParameter.InputParameter(inputParameter.inputAirFlow, "4100");
      await inputParameter.expectParameterValue(
        inputParameter.inputAirFlow,
        "4100",
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      await inputParameter.InputParameter(
        inputParameter.externalStaticPressure,
        "21",
      );
      await inputParameter.expectParameterValue(
        inputParameter.externalStaticPressure,
        "21",
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      //    unitOutput.netTotalCoolingCapacity = unitOutput.coolingCapacity
      // - outputData.fan.totalPowerConsumption

      let outPutData = authResponseBody.data?.outputData;
      let coolingCapacity =
        authResponseBody.data?.outputData?.unitOutput.coolingCapacity;
      let fanTotalPowerCunsumption = outPutData.fan.totalPowerConsumption;

      let netTotalCoolingCapacity = coolingCapacity - fanTotalPowerCunsumption;

      console.log(Math.round(netTotalCoolingCapacity * 100) / 100);

      await page
        .locator('[for="netTotalCoolingCapacity"]')
        .last()
        .textContent()
        .then((coolCap) => {
          console.log(coolCap, ":::::::::::::");
        });
      console.log(netTotalCoolingCapacity, ">>>>>>>>>");

      await page.pause();
    });
  });

  test.only("Dashboard ", async ({ page }) => {
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd621A);
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
    const getElectricalDataForONS = waitForApi(page, "getElectricalDataForONS");

    const checkCalResponse = await submitAndWaitForResponse(
      () => productConfigurationPage.proceed(),
      page,
      "performAllCalculations",
    );
    const authResponseBody = await checkCalResponse.json();
    expect(authResponseBody.message).toBe("Success");
    expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
      cyberAirDxModels.asd621A,
    );
    await Promise.all([
      condenserListResponsePromise,
      condenserFormattedResponsePromise,
      evaporatorExpertResponsePromise,
      compressorExpertResponsePromise,
    ]);

    await page.waitForLoadState("domcontentloaded");
    await page.pause();
    await expect(page.getByTitle("E-Datasheet")).toBeVisible();
    await page.getByTitle("E-Datasheet").click({ force: true });

    await page
      .locator("#ElectricalDataSheet>div>div")
      .filter({ hasText: "Electrical Data Sheet" })
      .isVisible();

    await page.getByText("Data sheet",{exact:true}).click({force:true})

    const getElectricalDataForONSRes = await getElectricalDataForONS;
    const resOFErd = await getElectricalDataForONSRes.json();
    expect(resOFErd.title).toBe("EDB Data Sheet");

    //a[title="Electrical Data Sheet"]
  });
});

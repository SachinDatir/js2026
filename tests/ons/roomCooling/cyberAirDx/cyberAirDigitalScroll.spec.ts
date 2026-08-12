import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { defaultUser } from "../../../../test-data/auth-users";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
import { InputPage } from "../../../../pages/ons/InputPage";
import { SettingPage } from "../../../../pages/ons/settingCal";
const { email, devPassword } = defaultUser;
test.describe("Validate the digital scroll", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputPage: InputPage;
  let settingPage: SettingPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    dashboardPage = new DashboardPage(page);
    inputPage = new InputPage(page);
    settingPage = new SettingPage(page);
    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, devPassword);
    await loginPage.expectAppOpened();
  });

  test("validate the min max scroll bar", async ({ page }) => {
    const deuProductLine = dashboardPage.roomCoolingDeuProductLine;
    const cyberAirCard = dashboardPage.CyberAirCard;
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

    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await dashboardPage.openRoomCooling();

    await dashboardPage.selectProductLine(deuProductLine, cyberAirCard);
    await dashboardPage.selectDischargeType("Upflow");
    await dashboardPage.selectCoolingSystem("A");
    await dashboardPage.selectCompressorType("Digital Scroll");
    await dashboardPage.selectModel(cyberAirDxModels.asu772Ad);

    const checkCalResponse = await submitAndWaitForResponse(
      () => productConfigurationPage.proceed(),
      page,
      "performAllCalculations",
    );
    const authResponseBody = await checkCalResponse.json();
    expect(authResponseBody.message).toBe("Success");
    expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
      cyberAirDxModels.asu772Ad,
    );

    await Promise.all([
      condenserListResponsePromise,
      condenserFormattedResponsePromise,
      evaporatorExpertResponsePromise,
      compressorExpertResponsePromise,
    ]);
    await test.step("open calculation setting", async () => {
      await page.locator('[title="Settings (v2)"]').click({ force: true });

      await inputPage.InputParameter(settingPage.input_relHumMin, "25");
      await inputPage.InputParameter(settingPage.input_relHumMax, "80");
      await page.waitForTimeout(1000);

      const checkCalResponse = await submitAndWaitForResponse(
        () => page.locator("#recalculateV2Btn").click({ force: true }),
        page,
        "performAllCalculations",
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      await expect(inputPage.inputRelHum.last()).toHaveAttribute("max", "80");
      await expect(inputPage.inputRelHum.last()).toHaveAttribute("min", "25");
    });
  });

  test.only("Validate the Refrigerent section", async ({ page }) => {
    const deuProductLine = dashboardPage.roomCoolingDeuProductLine;
    const cyberAirCard = dashboardPage.CyberAirCard;
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

    await test.step("Open the Dx model", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();

      await dashboardPage.selectProductLine(deuProductLine, cyberAirCard);
      await dashboardPage.selectDischargeType("Upflow");
      await dashboardPage.selectCoolingSystem("A");
      await dashboardPage.selectCompressorType("On/Off Scroll");
      await page.waitForTimeout(500);
      await dashboardPage.selectModel(cyberAirDxModels.ASU231A);

      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );
      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");
      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberAirDxModels.ASU231A,
      );

      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);
    });

    await test.step("Open setting v2 for Dx and validate the refrigerent section", async () => {
      const refrigerent = "R134a";
      const PressureSwitchCircuit1 = page.locator("#MessagePressureSwitchC1");
      await page.locator('[title="Settings (v2)"]').click({ force: true });
      await page
        .locator(".setting-card > .form-select")
        .selectOption(refrigerent, { force: true });

      await PressureSwitchCircuit1.uncheck({ force: true });
      const checkCalResponse = await submitAndWaitForResponse(
        () => page.locator("#recalculateV2Btn").click({ force: true }),
        page,
        "performAllCalculations",
      );
      await Promise.all([
        condenserListResponsePromise,
        condenserFormattedResponsePromise,
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      const reqBody = checkCalResponse.request();
      const rawFormData = await reqBody.postDataJSON();
      console.log(rawFormData.settingsData, ":::::::::::");
      expect(rawFormData.settingsData.Refrigerant).toBe(refrigerent);
      expect(rawFormData.settingsData["Pressure Switch (Circuit 1)"]).toBe(0);
    });

    await test.step("Open Gycol model in cyber Air", async () => {
      const coolingSystem = "GE";
      const checkCalResponse = await submitAndWaitForResponse(
        () => inputPage.inputCoolingSys.selectOption(coolingSystem),
        page,
        "performAllCalculations",
      );
      await Promise.all([
        evaporatorExpertResponsePromise,
        compressorExpertResponsePromise,
      ]);

      const reqBody = await checkCalResponse.request().postDataJSON();

      expect(reqBody.operatingConditions.operationMode).toBe("summer");

      await page.locator('[title="Settings (v2)"]').click({ force: true });
      const refrigerent = await page
        .locator(".setting-card > .form-select")
        .innerText();
      expect(refrigerent).toContain("R134a");
      //Mid-Point / Dew-Point (Circuit 1)
      await page
        .getByRole("checkbox", { name: "Checked = Mid-Point |" })
        .check({ force: true });

        const checkCalResponseGe = await submitAndWaitForResponse(
        () =>  page.locator("#recalculateV2Btn").click({ force: true }),
        page,
        "performAllCalculations",
      );
      const rawFormData = await checkCalResponseGe.request().postDataJSON();
      console.log(rawFormData.settingsData, ":::::::::::");
      expect(rawFormData.settingsData["Mid-Point/Dew-Point (Circuit 1)"]).toBe(1);
      await page.pause();
    });
  });
});

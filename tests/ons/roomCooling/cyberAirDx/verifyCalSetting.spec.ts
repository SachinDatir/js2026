import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { defaultUser } from "../../../../test-data/auth-users";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { InputPage } from "../../../../pages/ons/InputPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { SettingPage } from "../../../../pages/ons/settingCal";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
import { ProfilePage } from "../../../../pages/ons/profilePage";
import { SavingPage } from "../../../../pages/ons/savingSharingPage";
const { email, password } = defaultUser;

test.describe("Verify the old calculation setting", () => {
  let loginPage: LoginPage;
  let dashBoardPage: DashboardPage;
  let inputPage: InputPage;
  let productLinePage: ProductLinePage;
  let savingPage: SavingPage;
  let configurationData: {
    configName: string;
    configId?: any;
    originalValues?: any;
    updatedValues?: any;
  };
  let settingPage: SettingPage;
  let profilePage: ProfilePage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    inputPage = new InputPage(page);
    productLinePage = new ProductLinePage(page);
    settingPage = new SettingPage(page);
    profilePage = new ProfilePage(page);
    savingPage = new SavingPage(page);

    configurationData = {
      configName: "Test" + (+Date.now() % 100000),
    };
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await dashBoardPage.openRoomCooling();
    await dashBoardPage.roomCoolingDeuProductLine.isVisible();
  });

  test("Verify the login calculation setting dashboard", async ({
    page,
  }) => {
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
    const deuProductLine = dashBoardPage.deuProductLine;
    const cyberAirCard = dashBoardPage.CyberAirCard;

    await dashBoardPage.selectProductLine(deuProductLine, cyberAirCard);
    await dashBoardPage.selectDischargeType(" Downflow ");
    await dashBoardPage.selectCoolingSystem("A");
    // await dashBoardPage.selectCompressorType(" On/Off ");

    await dashBoardPage.selectModel(cyberAirDxModels.asd211A);

    // await submitAndWaitForResponse(=> dashBoardPage.proceed() , page, "performAllCalculations");
    const checkCalResponse = await submitAndWaitForResponse(
      () => dashBoardPage.proceed(),
      page,
      "performAllCalculations",
    );
    await checkCalResponse.json().then((res) => {
      expect(res).toHaveProperty("data");
      expect(res.data.outputData).toBeDefined();
      expect(res.data.outputData.unitOutput.unitType).toBe(
        cyberAirDxModels.asd211A,
      );

      // console.log("performAllCalculations response data:", res.data);
    });
    await Promise.all([
      condenserListResponsePromise,
      condenserFormattedResponsePromise,
      evaporatorExpertResponsePromise,
      compressorExpertResponsePromise,
    ]);

    let newAirFlowMin: string = "4000";
    let newAirFlowMax: string = "8000";
    let returnAirTempMin: string = "20";
    let returnAirTempMax: string = "45";
    await settingPage.settingTab.click();
    await page
      .locator("div")
      .filter({ hasText: /^Settings$/ })
      .isVisible();

    await page.waitForTimeout(2000);

    // await settingPage.input_Air_Flow_Min.fill(newAirFlowMin);

    await inputPage.InputParameter(
      settingPage.input_Air_Flow_Min,
      newAirFlowMin,
    );
    await inputPage.InputParameter(
      settingPage.input_Air_Flow_Max,
      newAirFlowMax,
    );
    await inputPage.InputParameter(
      settingPage.input_returnAirTemp_Min,
      returnAirTempMin,
    );
    await inputPage.InputParameter(
      settingPage.input_returnAirTemp_Max,
      returnAirTempMax,
    );
    await page.waitForTimeout(2000);

    await submitAndWaitForResponse(
      () =>
        page
          .getByRole("button", { name: "Recalculate" })
          .click({ force: true }),
      page,
      "thestEvaporatorExpertCalculation",
    );

    await expect(inputPage.operatingPointButton).toHaveCSS(
      "pointer-events",
      "none",
    );

    await expect(inputPage.inputAirFlow.last()).toHaveAttribute(
      "max",
      newAirFlowMax,
    );

    await expect(inputPage.inputAirFlow.last()).toHaveAttribute(
      "min",
      newAirFlowMin,
    );
    await expect(inputPage.inputReturnAirTemp.last()).toHaveAttribute(
      "min",
      returnAirTempMin,
    );

    await expect(inputPage.inputReturnAirTemp.last()).toHaveAttribute(
      "max",
      returnAirTempMax,
    );

    await page.waitForTimeout(4000);
    // let userDeviceListResponse = waitForApi(page, "userDeviceList");
    // await profilePage.profileButton.click();
    // await profilePage.profileTab.click();
    // await (await userDeviceListResponse).json().then((res) => {
    //   expect(res.status).toBe("success");
    // });

    // await expect(page.locator("p.user-name").last()).toContainText(email);

    // await submitAndWaitForResponse(
    //   () => page.goBack(),
    //   page,
    //   "performAllCalculations",
    // );

    await page.locator(".bxs-save").dblclick({ force: true });

    await expect(
      page.getByRole("heading", { name: "Save Configuration" }),
    ).toBeVisible();

    const targetProject = "Saving project";

    const dropdownContainer = page.locator(savingPage.projectDropDown);
    await page.locator(".bxs-down-arrow").first().click({ force: true });

    let dropDownValue = await dropdownContainer
      .locator(".list-project")
      .allTextContents();

    let projName = new Set(dropDownValue.map((t) => t.trim()));
    console.log("Project Name List:", projName);

    for (const project of projName) {
      if (project === targetProject) {
        console.log(`Match found! Clicking on: ${project}`);
        await dropdownContainer
          .getByText(project, { exact: true })
          .first()
          .click({ force: true });
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
    await expect(inputPage.inputAirFlow.last()).toHaveAttribute(
      "max",
      newAirFlowMax,
    );

    await expect(inputPage.inputAirFlow.last()).toHaveAttribute(
      "min",
      newAirFlowMin,
    );
    await expect(inputPage.inputReturnAirTemp.last()).toHaveAttribute(
      "min",
      returnAirTempMin,
    );

    await expect(inputPage.inputReturnAirTemp.last()).toHaveAttribute(
      "max",
      returnAirTempMax,
    );

    await Promise.all([
      condenserListResponsePromise,
      condenserFormattedResponsePromise,
      evaporatorExpertResponsePromise,
      compressorExpertResponsePromise,
    ]);
  });
});

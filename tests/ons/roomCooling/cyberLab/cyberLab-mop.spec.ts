import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { defaultUser } from "../../../../test-data/auth-users";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { generateLoginToken, waitForApi } from "../../../../support/ons-helper";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
import { cyberLabModels } from "../../../../test-data/ons-models";
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
    loginTokenResponse = await generateLoginToken(request, email, password);

    // Test implementation
    console.log("Generated Login Token:", loginTokenResponse);
    await page.goto("http://localhost:4200/");
    await page.waitForURL("**/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
  });

 test.afterEach(async ({ page, request }) => {
    
     try {
      await test.step("Open CyberLab model from Room Cooling", async () => {
        await dashboardPage.openRoomCooling();
        await productLinePage.selectCyberLab();
        await productConfigurationPage.selectModel(cyberLabModels.ASU211AL);
      });

      await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
        const condenserListResponsePromise = waitForApi(page, "condenserList");

        const checkCalResponse = await submitAndWaitForResponse(
          () => productConfigurationPage.proceed(),
          page,
          "performAllCalculations",
        );

        const authResponseBody = await checkCalResponse.json();
        expect(authResponseBody.message).toBe("Success");

        expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
          cyberLabModels.ASU211AL,
        );

        const requestBody = checkCalResponse.request().postDataJSON();

        await expect(requestBody).toBeDefined();
        await condenserListResponsePromise;

        await page.waitForLoadState("domcontentloaded");
      });

      await test.step("change the SI to US and validate the conversion on UI", async () => {
        const settingApi = page.waitForResponse(
          (response) =>
            response.url().includes("settings") && response.status() === 200,
        );
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);
        await expect(profilePage.profileButton).toBeVisible();
        await profilePage.profileButton.click({ force: true });
        await profilePage.profileTab.isVisible();
        await profilePage.profileTab.click({ force: true });
        await profilePage.preferredUnit.selectOption("US-Units");
        await expect(profilePage.preferredUnit).toHaveValue("US");
        await profilePage.saveButton.click();
        await page.getByText("Apply changes").isVisible();
        await page.getByText("Apply changes").click();

        const response = await settingApi;
        settingsApiUrl = response.url();
        console.log("Settings API URL:", settingsApiUrl);
        settingsRequestBody = response.request().postDataJSON();
        const settingResponse = await response.json();
        console.log(settingResponse);
        await expect([
          "Settings change successfully",
          "Settings already updated",
        ]).toContain(settingResponse.message);
      });

      await submitAndWaitForResponse(
        () => page.goBack(),
        page,
        "condenserFormatted",
      );
      // await page.goBack();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("domcontentloaded");
      // await page.pause();

      await page.waitForTimeout(1000);

      // Direct conversion
      const cfm = siToUsConversion("airFlow", 6000); // "3500"
      const returnAirTemp = siToUsConversion("returnAirTemp", 24); // "75.4"
      await page.waitForTimeout(500);
      console.log(`Direct CFM: ${cfm} CFM`);
      console.log(`Direct returnAirTemp: ${returnAirTemp} °F`);
      await submitAndWaitForResponse(
        () => page.reload(),
        page,
        "condenserFormatted",
      );
      await expect(page.locator(".flex-grow-1>input#inputAirFlow")).toHaveValue(
        cfm,
      );
    } finally {
      // await expect(page.locator('#inputRet').nth(2)).toHaveValue(
      //   returnAirTemp,
      // );
      await test.step("reset the preferred unit to SI", async () => {
        if (!loginTokenResponse) {
          console.warn(
            "Unable to reset preferred unit: login token was not created.",
          );
          return;
        }

        let resOfSetting;
        try {
          resOfSetting = await request.patch(
            "http://localhost:3000/v1/globals/profile/settings",
            {
              failOnStatusCode: false,
              headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${loginTokenResponse}`,
              },
              data: {
                ...(settingsRequestBody ?? {}),
                preferredUnit: "SI",
              },
            },
          );
        } catch (error) {
          console.warn(`Unable to reset preferred unit: ${error}`);
          return;
        }

        const contentType = resOfSetting.headers()["content-type"] ?? "";
        if (!contentType.includes("application/json")) {
          console.warn(
            `Unable to reset preferred unit: expected JSON from settings API, but received ${contentType || "unknown content-type"} with status ${resOfSetting.status()}: ${await resOfSetting.text()}`,
          );
          return;
        }

        const settRes = await resOfSetting.json();
        console.log(settRes);
        if (
          ![
            "Settings change successfully",
            "Settings updated successfully",
            "Settings already updated",
          ].includes(settRes.message)
        ) {
          console.warn(
            `Unable to reset preferred unit: ${resOfSetting.status()} ${settRes.message}`,
          );
        }
      });
    }
  });
  test("CyberLab MOP Test", { tag: "@SiUs" }, async ({ page, request }) => {
    try {
      await test.step("Open CyberLab model from Room Cooling", async () => {
        await dashboardPage.openRoomCooling();
        await productLinePage.selectCyberLab();
        await productConfigurationPage.selectModel(cyberLabModels.ASU211AL);
      });

      await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
        const condenserListResponsePromise = waitForApi(page, "condenserList");

        const checkCalResponse = await submitAndWaitForResponse(
          () => productConfigurationPage.proceed(),
          page,
          "performAllCalculations",
        );

        const authResponseBody = await checkCalResponse.json();
        expect(authResponseBody.message).toBe("Success");

        expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
          cyberLabModels.ASU211AL,
        );

        const requestBody = checkCalResponse.request().postDataJSON();

        await expect(requestBody).toBeDefined();
        await condenserListResponsePromise;

        await page.waitForLoadState("domcontentloaded");
      });

      await test.step("change the SI to US and validate the conversion on UI", async () => {
        const settingApi = page.waitForResponse(
          (response) =>
            response.url().includes("settings") && response.status() === 200,
        );
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);
        await expect(profilePage.profileButton).toBeVisible();
        await profilePage.profileButton.click({ force: true });
        await profilePage.profileTab.isVisible();
        await profilePage.profileTab.click({ force: true });
        await profilePage.preferredUnit.selectOption("US-Units");
        await expect(profilePage.preferredUnit).toHaveValue("US");
        await profilePage.saveButton.click();
        await page.getByText("Apply changes").isVisible();
        await page.getByText("Apply changes").click();

        const response = await settingApi;
        settingsApiUrl = response.url();
        console.log("Settings API URL:", settingsApiUrl);
        settingsRequestBody = response.request().postDataJSON();
        const settingResponse = await response.json();
        console.log(settingResponse);
        await expect([
          "Settings change successfully",
          "Settings already updated",
        ]).toContain(settingResponse.message);
      });

      await submitAndWaitForResponse(
        () => page.goBack(),
        page,
        "condenserFormatted",
      );
      // await page.goBack();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("domcontentloaded");
      // await page.pause();

      await page.waitForTimeout(1000);

      // Direct conversion
      const cfm = siToUsConversion("airFlow", 6000); // "3500"
      const returnAirTemp = siToUsConversion("returnAirTemp", 24); // "75.4"
      await page.waitForTimeout(500);
      console.log(`Direct CFM: ${cfm} CFM`);
      console.log(`Direct returnAirTemp: ${returnAirTemp} °F`);
      await submitAndWaitForResponse(
        () => page.reload(),
        page,
        "condenserFormatted",
      );
      await expect(page.locator(".flex-grow-1>input#inputAirFlow")).toHaveValue(
        cfm,
      );
    } finally {
      // await expect(page.locator('#inputRet').nth(2)).toHaveValue(
      //   returnAirTemp,
      // );
      await test.step("reset the preferred unit to SI", async () => {
        if (!loginTokenResponse) {
          console.warn(
            "Unable to reset preferred unit: login token was not created.",
          );
          return;
        }

        let resOfSetting;
        try {
          resOfSetting = await request.patch(
            "http://localhost:3000/v1/globals/profile/settings",
            {
              failOnStatusCode: false,
              headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${loginTokenResponse}`,
              },
              data: {
                ...(settingsRequestBody ?? {}),
                preferredUnit: "SI",
              },
            },
          );
        } catch (error) {
          console.warn(`Unable to reset preferred unit: ${error}`);
          return;
        }

        const contentType = resOfSetting.headers()["content-type"] ?? "";
        if (!contentType.includes("application/json")) {
          console.warn(
            `Unable to reset preferred unit: expected JSON from settings API, but received ${contentType || "unknown content-type"} with status ${resOfSetting.status()}: ${await resOfSetting.text()}`,
          );
          return;
        }

        const settRes = await resOfSetting.json();
        console.log(settRes);
        if (
          ![
            "Settings change successfully",
            "Settings updated successfully",
            "Settings already updated",
          ].includes(settRes.message)
        ) {
          console.warn(
            `Unable to reset preferred unit: ${resOfSetting.status()} ${settRes.message}`,
          );
        }
      });
    }
  });

  test("Validate the default parameters and calculation on MOP", async ({
    page,
  }) => {
    await test.step("Open CyberLab model from Room Cooling", async () => {
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberLab();
      await productConfigurationPage.selectModel(cyberLabModels.ASU211AL);
    });
    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
      const condenserListResponsePromise = waitForApi(page, "condenserList");

      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberLabModels.ASU211AL,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await condenserListResponsePromise;

      await page.waitForLoadState("domcontentloaded");
    });
    await test.step("go to the profile section", async () => {
      // const settingApi = page.waitForResponse(
      //   (response) =>
      //     response.url().includes("settings") && response.status() === 200,
      // );
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      await expect(profilePage.profileButton).toBeVisible();
      await profilePage.profileButton.click({ force: true });
      await profilePage.profileTab.isVisible();
      await profilePage.profileTab.click({ force: true });
    });

    await test.step("change default parameters", async () => {
      // await page.pause();
      // await page.locator("#inputAirFlow").fill("5000");
      await expect(page.locator("p.user-name").last()).toContainText(email);
      await page.getByText("Default parameters").first().isVisible();
      await page.getByText("Default parameters").first().click();
      // await page.waitForSelector("#defaultAirFlow-edit")
      await page.waitForTimeout(20000);

      await page
        .locator('input#defaultretAirTemp[type="checkbox"]')
        .click({ force: true });

      const checkbox = page.locator('input#defaultretAirTemp[type="checkbox"]');

      const checked = await checkbox.isChecked();
      console.log("Checked:", checked);

      if (!checked) {
        await page
          .locator('input#defaultretAirTemp[type="checkbox"]')
          .click({ force: true });
      }
      await page.locator("input#defaultretAirTemp").nth(1).click();

      await page.locator("input#defaultretAirTemp").nth(1).fill("29");
      await page.locator("input#defaultretAirTemp").nth(1).press("Enter");

      await page.locator("input#defaultrelHum[type='checkbox']").click({ force: true });
      const checkboxRelHum = page.locator("input#defaultrelHum[type='checkbox']");
      const checkedRelHum = await checkboxRelHum.isChecked();
      console.log("Checked:", checkedRelHum);

      if (!checkedRelHum) {
        await page.locator("input#defaultrelHum[type='checkbox']").click({ force: true });
      }

      await page.locator("input#defaultrelHum").nth(1).click({ force: true });
      await page.locator("input#defaultrelHum").nth(1).fill("52");
      await page.locator("input#defaultrelHum").nth(1).press("Enter");
      const defaultParamResponse = await submitAndWaitForResponse(
        () => page.locator("#saveDefaultParam").click(),
        page,
        "updateUserParams",
      );

      const defaultParamData = await defaultParamResponse.json();
      expect(defaultParamData.message).toBe(
        "Default params updated successfully",
      );
    });

    await submitAndWaitForResponse(
      () => page.goBack(),
      page,
      "condenserFormatted",
    );

    await submitAndWaitForResponse(
      () => page.reload(),
      page,
      "condenserFormatted",
    );
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator(".flex-grow-1>input#inputRet")).toHaveValue("29");
    await expect(page.locator(".flex-grow-1>input#inputRelHum")).toHaveValue(
      "52",
    );

    await submitAndWaitForResponse(
      () => inputPage.operatingPointButton.click(),
      page,
      "condenserFormatted",
    );

    await expect(page.locator(".flex-grow-1>input#inputRet")).toHaveValue("29");
    await expect(page.locator(".flex-grow-1>input#inputRelHum")).toHaveValue(
      "52",
    );
  });

  test("Validate super setting functionality", async ({ page }) => {
    const newAirFlowValue = "3500";
    const oldAirFlowValue = "3000";
    await test.step("Open CyberLab model from Room Cooling", async () => {
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberLab();
      await productConfigurationPage.selectModel(cyberLabModels.ASU211AL);
    });
    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
      const condenserListResponsePromise = waitForApi(page, "condenserList");

      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberLabModels.ASU211AL,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await condenserListResponsePromise;

      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("change in the super setting ", async () => {
      await page.waitForLoadState("domcontentloaded");
      await settingPage.settingTab.click();
      await settingPage.input_Air_Flow_Min.click();
      await settingPage.input_Air_Flow_Min.fill(newAirFlowValue);
      await settingPage.input_Air_Flow_Min.press("Enter");
      await submitAndWaitForResponse(
        () => page.getByText("Recalculate").click(),
        page,
        "condenserFormatted",
      );

      await page.waitForLoadState("domcontentloaded");
      await expect(inputPage.operatingPointButton).toHaveCSS(
        "pointer-events",
        "none",
      );
      // Target the div wrapping the button via its custom attribute
      const wrapper = page.getByTitle(
        "Cannot add operating points while calculation settings are customized.",
      );

      // Simply assert that this specific wrapper is visible
      await expect(wrapper).toBeVisible();

      await settingPage.settingTab.click();
      await settingPage.input_Air_Flow_Min.click();
      await settingPage.input_Air_Flow_Min.fill(oldAirFlowValue);
      await settingPage.input_Air_Flow_Min.press("Enter");
      await submitAndWaitForResponse(
        () => page.getByText("Recalculate").click(),
        page,
        "condenserFormatted",
      );
      await expect(inputPage.operatingPointButton).toBeEnabled();
    });
  });

  test("When op is added the super setting should not be editable", async ({
    page,
  }) => {
    await test.step("Open CyberLab model from Room Cooling", async () => {
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberLab();
      await productConfigurationPage.selectModel(cyberLabModels.ASU211AL);
    });
    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
      const condenserListResponsePromise = waitForApi(page, "condenserList");

      const checkCalResponse = await submitAndWaitForResponse(
        () => productConfigurationPage.proceed(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");

      expect(authResponseBody.data?.outputData?.unitOutput.unitType).toBe(
        cyberLabModels.ASU211AL,
      );

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await condenserListResponsePromise;

      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("change in the super setting ", async () => {
      await page.waitForLoadState("domcontentloaded");
      // await settingPage.settingTab.click();

      // await page.waitForLoadState("domcontentloaded");
      // await expect(inputPage.operatingPointButton).toHaveCSS(
      //   "pointer-events",
      //   "none",
      // );
      // Target the div wrapping the button via its custom attribute

      await expect(inputPage.operatingPointButton).toBeEnabled();
      await submitAndWaitForResponse(
        () => inputPage.operatingPointButton.click(),
        page,
        "condenserFormatted",
      );

      await expect(settingPage.settingTab).toHaveCSS("pointer-events", "none");
    });
  });
  // test.afterEach(async ({ request }) => {
  //   if (!loginTokenResponse) {
  //     console.warn("Unable to reset preferred unit: login token was not created.");
  //     return;
  //   }

  //   let resOfSetting;
  //   try {
  //     resOfSetting = await request.patch(
  //     "http://localhost:3000/v1/globals/profile/settings",
  //       {
  //         failOnStatusCode: false,
  //         headers: {
  //           accept: "application/json",
  //           "content-type": "application/json",
  //           authorization: `Bearer ${loginTokenResponse}`,
  //         },
  //         data: {
  //           ...(settingsRequestBody ?? {}),
  //           preferredUnit: "SI",
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     console.warn(`Unable to reset preferred unit: ${error}`);
  //     return;
  //   }

  //   const contentType = resOfSetting.headers()["content-type"] ?? "";
  //   if (!contentType.includes("application/json")) {
  //     console.warn(
  //       `Unable to reset preferred unit: expected JSON from settings API, but received ${contentType || "unknown content-type"} with status ${resOfSetting.status()}: ${await resOfSetting.text()}`,
  //     );
  //     return;
  //   }

  //   const settRes = await resOfSetting.json();
  //   console.log(settRes);
  //   if (
  //     ![
  //       "Settings change successfully",
  //       "Settings updated successfully",
  //       "Settings already updated",
  //     ].includes(
  //       settRes.message,
  //     )
  //   ) {
  //     console.warn(
  //       `Unable to reset preferred unit: ${resOfSetting.status()} ${settRes.message}`,
  //     );
  //   }
  // });
});

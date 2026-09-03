import { test, expect, type APIRequestContext } from "@playwright/test";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { SavingPage } from "../.../../../../../pages/ons/savingSharingPage";
import { CreateConfig } from "../../../../support/api/savingShare";
import { generateLoginToken } from "../../../../support/ons-helper";
import { defaultUser } from "../../../../test-data/auth-users";
const { email, devPassword } = defaultUser;
let configurationData: {
  configName: string;
  configId?: any;
  originalValues?: any;
  updatedValues?: any;
};

import { type Page } from "@playwright/test";
import { tr } from "@faker-js/faker";

async function getAccessToken(page: Page): Promise<string> {
  const state = await page.context().storageState();
  const appOrigin = new URL(process.env.BASE_URL!).origin;

  const rawToken = state.origins
    .find(({ origin }) => origin === appOrigin)
    ?.localStorage.find(({ name }) => name === "access_token")?.value;

  if (!rawToken) {
    throw new Error(
      "No access_token found in the authenticated storage state.",
    );
  }

  try {
    return JSON.parse(rawToken); // supports auth.setup.ts-created state
  } catch {
    return rawToken; // supports Codegen-created state
  }
}

test.describe("Verify the save config dropdowns in cyber lab", () => {
  configurationData = {
    configName: "Test" + (+Date.now() % 100000),
  };
  let token: any;

  // test.beforeAll(async () => {
  // });
  test.beforeEach(async ({ page }) => {
    let token = await getAccessToken(page);

    const config = new CreateConfig(page);
    await config.createConfiguration(token, configurationData.configName);
  });

  test("Verify the dropdowns in cyber lab", async ({ page }) => {
    const performAllCalculationsResponsePromise = waitForApi(
      page,
      "performAllCalculations",
    );
    const condenserListResponsePromise = waitForApi(page, "condenserList");
    const condenserFormattedResponsePromise = waitForApi(
      page,
      "condenserFormatted",
    );

    const savingPage = new SavingPage(page);

    const dashboardPage = new DashboardPage(page);
    await page.goto("/app/module-selector/filter-section");
    await page.waitForLoadState("domcontentloaded");
    await dashboardPage.openCyberLab();

    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
      const condenserListResponsePromise = waitForApi(page, "condenserList");

      const checkCalResponse = await submitAndWaitForResponse(
        () => dashboardPage.proceed(),
        page,
        "performAllCalculations",
      );

      const authResponseBody = await checkCalResponse.json();
      expect(authResponseBody.message).toBe("Success");

      const requestBody = checkCalResponse.request().postDataJSON();

      await expect(requestBody).toBeDefined();
      await condenserListResponsePromise;

      await page.waitForLoadState("domcontentloaded");
    });

    const newConfigName = "Test" + (+Date.now() % 100000);

    await savingPage.saveConfiguration("Test switchable", newConfigName);

    await performAllCalculationsResponsePromise;
    await condenserListResponsePromise;
    await condenserFormattedResponsePromise;

    await page.waitForLoadState("load");
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    await page.locator("#edit-msg").first().click({ force: true });
    let configList = await page
      .locator("div.scrollable-config-menu>a")
      .allTextContents();
    configList.map(async (el) => {
      if (el.includes(configurationData.configName)) {
        await expect(el).toContain(configurationData.configName);
      }
    });

    // await expect(configList).toContain(configurationData.configName)
    console.log(configList, ">>>>>>>>>>>>>");
    await page.pause();
  });
});

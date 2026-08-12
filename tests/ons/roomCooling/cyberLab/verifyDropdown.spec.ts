import { test, expect } from "@playwright/test";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { SavingPage } from "../.../../../../../pages/ons/savingSharingPage";

let configurationData: {
  configName: string;
  configId?: any;
  originalValues?: any;
  updatedValues?: any;
};

test.describe("Verify the save config dropdowns in cyber lab", () => {
  configurationData = {
    configName: "Test" + (+Date.now() % 100000),
  };
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

    await savingPage.saveConfiguration(
      "Test ONS",
      configurationData.configName,
    );

    await performAllCalculationsResponsePromise;
    await condenserListResponsePromise;
    await condenserFormattedResponsePromise;

    await page.pause()
  });
});

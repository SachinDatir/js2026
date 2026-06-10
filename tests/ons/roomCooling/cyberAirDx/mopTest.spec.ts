import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { defaultUser } from "../../../../test-data/auth-users";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { waitForApi } from "../../../../support/ons-helper";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
import { InputPage } from "../../../../pages/ons/InputPage";
const { email, devPassword } = defaultUser;

async function getOperatingPointOutput(page: Page, operatingPointName: string) {
  const escapedOperatingPointName = operatingPointName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const operatingPointHeading = page
    .locator("#output-container h6", {
      hasText: new RegExp(`^\\s*${escapedOperatingPointName}\\s*$`),
    })
    .last();
  const operatingPointTable = operatingPointHeading.locator(
    "xpath=ancestor::div[contains(@class, 'custom-grid')][1]/table",
  );

  await expect(operatingPointHeading).toBeVisible();
  await expect(operatingPointTable).toBeVisible();

  const outputText = await operatingPointTable.textContent();
  console.log(`${operatingPointName} Output:`, outputText);
  return outputText;
}

test.describe("CyberAir DX Room Cooling Test", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputPage: InputPage;
  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputPage = new InputPage(page);
  });

  test("CyberAir DX Room Cooling Test", async ({ page }) => {
    // Test implementation
    await page.goto("https://development.oneselect.global/");
    await page.waitForURL("**/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, devPassword);
    await test.step("Open CyberAir model from Room Cooling", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
      await dashboardPage.openRoomCooling();
      await productLinePage.selectCyberAir();
      await productConfigurationPage.selectModel(cyberAirDxModels.asd241A);
    });

    await test.step("Validate the performAllCalculations after entering into the configuration", async () => {
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

    await test.step("Validate the performAllCalculations after adding the operating point", async () => {
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
        async () => await inputPage.operatingPointButton.click(),
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

    await expect(page.locator("#tab-link-1")).toBeVisible();
    await expect(page.locator('app-expert-tab-crac-crah').getByText('Primary')).not.toHaveClass(/active/);
    await expect(page.locator("#tab-link-1")).toHaveClass(/active/);

    await page.locator("input#inputExt").first().click();
    await page.locator("input#inputExt").first().fill("21");
    await Promise.all([
      page.waitForResponse("**/performAllCalculations"),
      page.locator("input#inputExt").first().press("Enter"),
    ]);

    //updated relative humidity
    await page.locator("input#inputRelHum").first().click();
    await page.locator("input#inputRelHum").first().fill("35");
    await Promise.all([
      page.waitForResponse("**/performAllCalculations"),
      page.locator("input#inputRelHum").first().press("Enter"),
    ]);

    await getOperatingPointOutput(page, "OP 1");
    await page.pause();
  });
});

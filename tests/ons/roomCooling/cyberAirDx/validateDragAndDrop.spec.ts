import { test, expect, Page } from "@playwright/test";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { defaultUser } from "../../../../test-data/auth-users";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
const { email, password } = defaultUser;

test.describe("Validate the drang and drop functioanlity", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);

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
    });

    // 1. Locate the element
    const element = page.locator(".drag-ic").nth(1);

    // // 2. Get the bounding box of the element to know its current position
    const box = await element.boundingBox();

    if (box) {
      // Calculate the starting center point of the element
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      // Define how far down you want to drag it (e.g., 200 pixels down)
      const dragDistance = 20;
      const endY = startY - dragDistance;

      // 3. Perform the manual drag actions
      await page.mouse.move(startX, startY);
      await page.mouse.down();

      // Moving in steps helps the UI register that a drag event is happening
      await page.mouse.move(startX, endY, { steps: 10 });

      await page.mouse.up();
    }
    await page.waitForTimeout(2000);
    const targetTable = await page.locator(".table").nth(2);
    const tableCells = targetTable.locator("tbody tr td");
    const allTexts = await tableCells.allTextContents();
    expect(allTexts[2].trim()).toBe(cyberAirDxModels.asd241A);
    const cleanedTexts = allTexts
      .map((text) => text.trim())
      .filter((text) => text);

    expect(cleanedTexts).toContain(cyberAirDxModels.asd241A);
  });
});

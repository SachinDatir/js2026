import { expect, test } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { waitForApi } from "../../../support/ons-helper";
import { defaultUser } from "../../../test-data/auth-users";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { InputPage } from "../../../pages/ons/InputPage";
import { ProductLinePage } from "../../../pages/ons/ProductLinePage";
import { SettingPage } from "../../../pages/ons/settingCal";

const { email, password } = defaultUser;

test.describe("", () => {
  let loginPage: LoginPage;
  let dashBoardPage: DashboardPage;
  let inputPage: InputPage;
  let productLinePage: ProductLinePage;
  let settingPage: SettingPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    inputPage = new InputPage(page);
    productLinePage = new ProductLinePage(page);
    settingPage = new SettingPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await dashBoardPage.openRoomCooling();
    await page.locator("#DEU").getByText("CyberLab").click();
  });

  test("Verify the cyberLab functionality", async ({ page }) => {
    await page.locator("#DEU").getByText("CyberLab").click();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/performAllCalculations") &&
        response.status() === 200,
    );
    await dashBoardPage.proceed();

    const response = await responsePromise;
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    const rangeInput = page.locator(".flex-grow-1 >#inputAirFlow");
    // Assert that the min and max attributes have the expected values
    await expect(rangeInput).toHaveAttribute("min", "3000");
    await expect(rangeInput).toHaveAttribute("max", "7000");

    await settingPage.settingTab.click({ force: true });

    await page.waitForSelector("si-us-formatter#inputVolumenstromMin input");
    await page.locator("si-us-formatter#inputVolumenstromMin input").click();
    await page
      .locator("si-us-formatter#inputVolumenstromMin input")
      .fill("2500");

    await page.locator("si-us-formatter#inputVolumenstromMax input").click();
    await page
      .locator("si-us-formatter#inputVolumenstromMax input")
      .fill("7500");

    await page.route("../performAllCalculations", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.route("../condenserFormatted", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.waitForTimeout(2000);
    await page.locator("#recalculateId").click({ force: true });
    await page.waitForTimeout(2000);

    await expect(rangeInput).toHaveAttribute("min", "2500");
    await expect(rangeInput).toHaveAttribute("max", "7500");

    const condensorCard = page.locator("#condensorInputId");
    await condensorCard.click();

    // Verify that pointer-events are set to none, preventing clicks
    await expect(condensorCard).toHaveCSS("pointer-events", "auto", {
      timeout: 5000,
    });
    await page.pause();
  });

  test.only("verify the print functionality", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/performAllCalculations") &&
        response.status() === 200,
    );

    const responseCond = page.waitForResponse(
      (response) =>
        response.url().includes("/condenserFormatted") &&
        response.status() === 200,
    );

    const printResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/printDoc") && response.status() === 200,
    );

    await dashBoardPage.proceed();

    const response = await responsePromise;
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    const responseCondenser = await responseCond;
    const responseBodyCondenser = await responseCondenser.json();
    expect(responseBodyCondenser).toBeDefined();

    await page.locator('a[title="Print"]').click();
    await printResponse;
    // Add assertions for print functionality

    await page.pause();
  });
});

import { test, expect } from "@playwright/test";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
test.describe("Verify the parload for Dx models", () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;
  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
    await page.goto("app/module-selector/filter-section");
    await page.waitForLoadState("domcontentloaded");
    await loginPage.expectLoaded();
    await dashboardPage.openRoomCooling();
  });

  test("Verify the Airflow constant for Dx", async ({ page }) => {
    const deu = dashboardPage.deuProductLine;
    
  });
});

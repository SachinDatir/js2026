import { test, expect } from "@playwright/test";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import {
  chinaProductLineNames,
  deuProductLineNames,
  spainProductlineName,
  usaProductlineName,
} from "../../../test-data/ons-models";
test.describe("verify the product selection page", () => {
  let dashboardPage: DashboardPage;
  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto("app/module-selector/filter-section");
    await page.waitForLoadState("domcontentloaded");
    await dashboardPage.openRoomCooling();
  });

  test("Verify the every kingdom productlines", async ({ page }) => {
    const deuProductLine = dashboardPage.deuProductLine;
    await dashboardPage.deuProductLine.isVisible();
    // Deu productline
    for (const products of deuProductLineNames) {
      await deuProductLine
        .getByRole("heading", { name: products, exact: true })
        .isVisible();
    }

    // CHN
    const chinaProductLine = dashboardPage.chnProductLine;

    for (const productLines of chinaProductLineNames) {
      await chinaProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .isVisible();
      await chinaProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .click();
    }

    // esp

    const espProductLine = dashboardPage.espProductLine;

    for (const productLines of spainProductlineName) {
      await espProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .isVisible();
      await espProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .click();
    }


    //USA
        const usaProductLine = dashboardPage.usaProductLine;

    for (const productLines of usaProductlineName) {
      await espProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .isVisible();
      await usaProductLine
        .getByRole("heading", { name: productLines, exact: true })
        .click();
    }
    await page.pause();
  });
});

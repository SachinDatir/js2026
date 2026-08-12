import { test, expect, type Locator } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { ProductLinePage } from "../../../pages/ons/ProductLinePage";
import { InputPage } from "../../../pages/ons/InputPage";
test.describe("Validate the CC2 MOP", () => {
  let loginPage: LoginPage;
  let dashBoardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let inputPage: InputPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    inputPage = new InputPage(page);

    await page.goto("/app/module-selector/filter-section");
    await page.waitForLoadState("domcontentloaded");
    await dashBoardPage.deuProductLine.isVisible();
    await dashBoardPage.openChiller();
    await dashBoardPage.selectProductLine(
      dashBoardPage.deuProductLine,
      dashBoardPage.cc2Card,
    );
  });
  test("Verify the mop for CC2", async ({ page }) => {
    await test.step("Select the parameters for CC2", async () => {
      let powerSupply = " 400V/50Hz 3Ph/N/PE ";
      await page.waitForLoadState("domcontentloaded");
      await dashBoardPage.selectCompressorType("Screw");
      await dashBoardPage.selectCoolingType("Free cooling");
      await dashBoardPage.selectCasingSize("All");
      await dashBoardPage.selectNoiseData("Standard");
      await dashBoardPage.selectRefrigerantType("R513A");
      await dashBoardPage.selectPowerSupply(powerSupply);
    });

    await page.pause();
  });
});

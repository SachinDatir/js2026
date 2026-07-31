import { test, expect, type Locator } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../support/utils/wait-utils";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { ProductLinePage } from "../../../pages/ons/ProductLinePage";
import { InputPage } from "../../../pages/ons/InputPage";
test.describe("Validate the mop", async () => {
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
    await waitForApi(page, "modelSelectionFilters");
    await dashBoardPage.roomCoolingDeuProductLine.isVisible();
  });

  test("Verify the mop for CCI", async ({ page }) => {
    // await
    await dashBoardPage.openChiller();
    await dashBoardPage.selectProductLine(
      dashBoardPage.deuProductLine,
      dashBoardPage.cciIndoor,
    );

    const calRes = await submitAndWaitForResponse(
      () => dashBoardPage.proceed(),
      page,
      "performCalculation",
    );

    const res = await calRes.json();

    console.log(res.data, ">>>>>>>>>>>>>>>");
    expect(res.data).toBeDefined();

    // add three mop
    for (let i = 1; i <= 3; i++) {
      await submitAndWaitForResponse(
        () => inputPage.operatingPointButton.click(),
        page,
        "performCalculation",
      );

      await expect(
        page.locator(".selected-op-header-card").nth(0),
      ).toContainText(` Selected OP : OP ${i} `);
      await page
        .locator("a")
        .filter({ hasText: `OP : ${i} /` })
        .isVisible();
    }
    const compressorStep = page
      .locator(".flex-grow-1 > #inputcompressorStep")
      .last();

    const newCompSteps = "80";
    const updateInputValue = async (
      locator: Locator,
      newValue: string | number,
    ) => {
      locator.evaluate((element:any, newValue) => {
        element.value = newValue;

        element.dispatchEvent(new Event("input", { bubbles: true }));

        element.dispatchEvent(new Event("change", { bubbles: true }));
      }, newValue);
    };

    await submitAndWaitForResponse(
      () => updateInputValue(compressorStep, newCompSteps),
      page,
      "performCalculation",
    );
    await expect(await compressorStep.inputValue()).toBe("80");
  });
});

import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { generateLoginToken } from "../../../../support/api/auth-api";
import { defaultUser } from "../../../../test-data/auth-users";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
import { waitForApi } from "../../../../support/utils/wait-utils";
import { submitAndWaitForResponse } from "../../../../support/utils/wait-utils";
import { CheckOAuthUserResponse } from "../../../../pages/auth/LoginPage";
import { InputPage } from "../../../../pages/ons/InputPage";
let loginTokenResponse: unknown;
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let productLinePage: ProductLinePage;
let productConfigurationPage: ProductConfigurationPage;
let inputParameter: InputPage;
const { email, password } = defaultUser;

// loginTokenResponse = await generateLoginToken(request, email, password);
test.skip("validate the tab", async ({ page, context }) => {
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
  productLinePage = new ProductLinePage(page);
  productConfigurationPage = new ProductConfigurationPage(page);
  inputParameter = new InputPage(page);

  await loginPage.open();
  await loginPage.expectLoaded();
  await loginPage.loginAndValidate(email, password);
  await loginPage.expectAppOpened();
  await page.waitForTimeout(1000);
  await page.waitForLoadState("domcontentloaded");
  const stulzIndia = context.waitForEvent("page");

  test.step("click on stulz india tab", async () => {
    await page.locator('[href="http://stulz.in/"]').click({ force: true });
  });
  const newTab = await stulzIndia;
  await newTab.waitForLoadState();
  await page.pause();
});

test("Handle multiple manual tabs", async ({ context }) => {
  // Create second tab
  const page1 = await context.newPage();
  const brokenLinks = page1.locator(".footer__item>a");

  await page1.goto("https://playwright.dev");

  await brokenLinks.nth(4).scrollIntoViewIfNeeded();
  await expect(brokenLinks.nth(4)).toHaveAttribute(
    "href",
    "https://stackoverflow.com/questions/tagged/playwright",
  );
  const page2 = context.waitForEvent("page");
  await brokenLinks.nth(4).click({ force: true });
  const newPage = await page2;
  await newPage.waitForLoadState("domcontentloaded");
  await newPage.waitForSelector('[data-testid="watch-tag-button"]');
  await newPage
    .locator('[data-testid="watch-tag-button"]')
    .isVisible({ timeout: 4000 });
  //   await page1.pause();
});

test("Handle multiple tabs by using promises", async ({ context }) => {
  // Create second tab
  const page1 = await context.newPage();
  const brokenLinks = page1.locator(".footer__item>a");

  await page1.goto("https://playwright.dev");

  await brokenLinks.nth(4).scrollIntoViewIfNeeded();
  await expect(brokenLinks.nth(4)).toHaveAttribute(
    "href",
    "https://stackoverflow.com/questions/tagged/playwright",
  );
  // const page2 =
  const [pag2Res] = await Promise.all([
    context.waitForEvent("page"),

    brokenLinks.nth(4).click({ force: true }),
  ]);

  const newPage = pag2Res;
  await newPage.waitForLoadState("domcontentloaded");
  await newPage.waitForSelector('[data-testid="watch-tag-button"]');
  await newPage
    .locator('[data-testid="watch-tag-button"]')
    .isVisible({ timeout: 4000 });
  //   await page1.pause();
});

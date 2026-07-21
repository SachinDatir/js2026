import { test, webkit, chromium, firefox } from "@playwright/test";
import { LoginPage } from "../../pages/auth/LoginPage";
import { defaultUser } from "../../test-data/auth-users";
import { DashboardPage } from "../../pages/ons/DashboardPage";
const { email, password } = defaultUser;
test.describe("Verify login with different browser profiles", () => {
  // test.beforeEach(async ({ page }) => {});
  test("Verify login in chromium browser", async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    let loginPage: LoginPage;
    loginPage = new LoginPage(page);
    // await context.newPage();

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.pause();
  });

  test("Verify login in microsoft edge browser", async () => {
    const browser = await chromium.launch({
      channel: "msedge", //This tells Playwright to use your local Edge browser
      headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    let loginPage: LoginPage;
    loginPage = new LoginPage(page);
    // await context.newPage();

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.pause();
  });

  test.only("Verify login in webkit browser", async () => {
    const browser = await firefox.launch({
      headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    let loginPage: LoginPage;
    loginPage = new LoginPage(page);
    let dashboardPage: DashboardPage;
    dashboardPage = new DashboardPage(page);
    // await context.newPage();

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await dashboardPage.chillerCard.isVisible({timeout: 10000});
    await page.reload()
    await dashboardPage.chillerCard.isVisible({timeout: 50000});

  });
});

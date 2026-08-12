import { test } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { ProductConfigurationPage } from "../../../pages/ons/ProductConfigurationPage";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { InputPage } from "../../../pages/ons/InputPage";
import { SettingPage } from "../../../pages/ons/settingCal";
import { defaultUser } from "../../../test-data/auth-users";
import { waitForApi } from "../../../support/utils/wait-utils";

const { email, devPassword } = defaultUser;
test.describe("Validate the new cal setting", () => {
  let loginPage: LoginPage;
  let productConfigurationPage: ProductConfigurationPage;
  let dashboardPage: DashboardPage;
  let inputPage: InputPage;
  let settingPage: SettingPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    dashboardPage = new DashboardPage(page);
    inputPage = new InputPage(page);
    settingPage = new SettingPage(page);
    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, devPassword);
    await loginPage.expectAppOpened();
  });

  test("Validate the Air Handling Units", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
  });
});

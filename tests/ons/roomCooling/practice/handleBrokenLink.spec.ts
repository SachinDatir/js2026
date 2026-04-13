import { test, expect, type Locator } from "@playwright/test";
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
import { ProfilePage } from "../../../../pages/ons/profilePage";
const { email, password } = defaultUser;

test.describe("Validate the brokenmlinks", () => {
  let loginTokenResponse: unknown;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productLinePage: ProductLinePage;
  let productConfigurationPage: ProductConfigurationPage;
  let inputParameter: InputPage;
  let profilePage: ProfilePage;

  // test.beforeEach(async ({ page, request }) => {

  // });

  test("should be able to handle the broken links", async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productLinePage = new ProductLinePage(page);
    productConfigurationPage = new ProductConfigurationPage(page);
    inputParameter = new InputPage(page);
    profilePage = new ProfilePage(page);

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();

    await test.step("wait for dom to get the stable", async () => {
      await page.waitForLoadState("domcontentloaded");
      await waitForApi(page, "modelSelectionFilters");
    });

    await test.step("proceed with profile page", async () => {
      const listOfUserApi = waitForApi(page, "admin/list?search=&limit");
      const listProductionFacility = waitForApi(
        page,
        "/listProductionFacility",
      );
      await expect(profilePage.profileButton).toBeVisible();
      await profilePage.profileButton.click({ force: true });
      await expect(page.locator("#dropdownId").locator(".name")).toHaveText(
        "Sachin Datir",
      );
      await profilePage.profileTab.isVisible();
      await profilePage.userManagement.click({ force: true });
      let apiRes = await listOfUserApi;
      await expect(apiRes.json()).toBeTruthy();
      console.log(apiRes.json());

      const links = await profilePage.tabList.all();
      const arr = [];

      for (const link of links) {
        let href = await link.getAttribute("href");

        if (href && href.startsWith("/")) {
          const targetPath = href;
          arr.push(targetPath);
        }
      }

      console.log("Final Array:", arr);

      for (let i = 0; i < arr.length; i++) {
        const tabLocator = page.locator(`[href="${arr[i]}"]`);
        await tabLocator.click({ force: true });

        if (arr[i]) {
          await listProductionFacility;
        } else if (arr[i] == arr[i - 1]) {
          return false;
        }
        await page.waitForTimeout(2000);
      }
    });
  });

  test.only("Validate the ESPN sports broken links", async ({ page }) => {
    const arr = [];

    await page.goto("https://www.espncricinfo.com/");
    await page.waitForLoadState("domcontentloaded");
    // const links = await page.locator('[class="ds-flex ds-flex-row"]>div>a').all;

    const links = await page
      .locator('[class="ds-flex ds-flex-row"]>div>a')
      .all();
    for (const link of links) {
      let href = await link.getAttribute("href");

      if (href && href.startsWith("/")) {
        arr.push(href);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      await page.locator(`[href="${arr[i]}"]`).click({ force: true });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      console.log(arr[i]);
      if (arr[i].includes("/cricket-videos")) {
        console.log("/cricket-videos", "skipping");
        continue
      } 
        await expect(page.url()).toContain(
          `https://www.espncricinfo.com${arr[i]}`,
        );
      
    }

    // console.log(arr);
  });
});

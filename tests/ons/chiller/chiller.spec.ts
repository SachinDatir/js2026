import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { waitForApi } from "../../../support/utils/wait-utils";

const email = process.env.EMAIL!;
const password = process.env.DEV_PASSWORD!;

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto("/"); // use baseURL from config
  await loginPage.expectLoaded();
});

test("Validate the chiller partload calculation Compressor Step (%) functionality", async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  // await loginPage.loginAndValidate(email, password);

  // ✅ Navigation
  await page.waitForTimeout(2000);
  await page.locator('[src="assets/img/app/app/chiller_units.png"]').click();
  await page
    .locator("#DEU")
    .getByRole("heading", { name: "CyberCool 2" })
    .click();
  await waitForApi(page, "listFilteredModels");
  // ✅ Intercept + action (NO race condition)
  let [response] = await Promise.all([
    waitForApi(page, "performCalculation"),
    page.getByRole("button", { name: "Proceed" }).click(),
  ]);

  // ✅ Validate API
  expect(response.status()).toBe(200);
  let body = await response.json();
  expect(body.status).toBe("success");

  // ✅ Second API call
  [response] = await Promise.all([
    waitForApi(page, "performCalculation"),
    page.getByTitle("Add operating point").click({ force: true }),
  ]);

  expect(response.status()).toBe(200);
  body = await response.json();
  expect(body.status).toBe("success");

  const compressorInput = page.locator("input#inputcompressorStep").first();
  await compressorInput.click();
  await compressorInput.fill("80");

  await expect(page.locator("#inputTempIn").nth(3)).toBeDisabled();
});

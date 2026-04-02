import { test, expect } from "@playwright/test";
import { loginAndValidate } from "../support/registration-utils";

const email = process.env.EMAIL!;
const password = process.env.PASSWORD!;

test.beforeEach(async ({ page }) => {
  await page.goto("/"); // use baseURL from config
  await expect(page.locator('[href="/auth/registration"]')).toBeEnabled();
});

test("Validate the chiller partload calculation Compressor Step (%) functionality", async ({
  page,
}) => {
  const waitForApi = (url: string) =>
    page.waitForResponse((res) => res.url().includes(url));

  await loginAndValidate(page, email, password);

  // ✅ Navigation
  await page.waitForTimeout(2000);
  await page.locator('[src="assets/img/app/app/chiller_units.png"]').click();
  await page
    .locator("#DEU")
    .getByRole("heading", { name: "CyberCool 2" })
    .click();
  await waitForApi("listFilteredModels");
  // ✅ Intercept + action (NO race condition)
  let [response] = await Promise.all([
    waitForApi("performCalculation"),
    page.getByRole("button", { name: "Proceed" }).click(),
  ]);

  // ✅ Validate API
  expect(response.status()).toBe(200);
  let body = await response.json();
  expect(body.status).toBe("success");

  // ✅ Second API call
  [response] = await Promise.all([
    waitForApi("performCalculation"),
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

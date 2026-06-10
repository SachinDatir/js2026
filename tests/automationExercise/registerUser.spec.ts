import { test, expect } from "@playwright/test";

test.describe("Register User", () => {
  test("should register a new user successfully", async ({ page }) => {
    await page.goto("https://automationexercise.com/");
    await page.waitForLoadState("domcontentloaded");
    await page.locator('[src="/static/images/home/logo.png"]').isVisible();
    await page.click("a[href='/login']");
    await page.waitForURL("**/login");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("textbox", { name: "Name" }).fill("testUser");
    await page
      .locator("form")
      .filter({ hasText: "Signup" })
      .getByPlaceholder("Email Address")
      .fill("Skdtest@example.com");
    await page.getByRole("button", { name: "Signup" }).click();

    await page.waitForURL("**/signup");
    await page.getByText("Mr.").check();
    await page.getByRole("textbox", { name: "Password *" }).fill("Test@123");
    await page.locator("#days").selectOption("10");
    await page.locator("#months").selectOption("5");
    await page.locator("#years").selectOption("1990");

    await page.getByText("Sign up for our newsletter!").check();
    await page.getByText("Receive special offers from our partners!").check();

    await page.getByRole("textbox", { name: "First name *" }).fill("Test");
    await page.getByRole("textbox", { name: "Last name *" }).fill("User");

    await page
      .getByRole("textbox", { name: "Address * (Street address, P." })
      .fill("123 Test Street");
    await page.getByRole("textbox", { name: "State *" }).fill("Test State");
    await page.locator('[data-qa="city"]').fill("Test City");
    await page.locator('[data-qa="zipcode"]').fill("12345");
    await page.locator('[data-qa="mobile_number"]').fill("1234567890");
    await page.locator('[data-qa="create-account"]').click();
    await page.waitForURL("**/account_created");
    await page.locator('[data-qa="account-created"]').isVisible();
    await page.pause();
  });
});

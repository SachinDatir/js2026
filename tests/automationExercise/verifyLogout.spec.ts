import { test, expect } from "@playwright/test";
import { AutomationExercise } from "../../pages/automationExercise";
const email = "Skdtest@example.com";
const password = "Test@123";
test.describe("Verify the logout and login functionality", () => {
  let practicePage: AutomationExercise;

  test.beforeEach(async ({ page }) => {
    practicePage = new AutomationExercise(page);
  });
  test("User should login and logout", async ({ page }) => {
    await page.goto("https://automationexercise.com/login", {
      waitUntil: "load",
    });
    await page.waitForLoadState("domcontentloaded");
    await practicePage.emailField.fill(email);
    await practicePage.passwordField.fill(password);
    await practicePage.loginButton.click();
    await page.waitForSelector(practicePage.logoutButton);
    await page
      .getByRole("heading", { name: "Full-Fledged practice website" })
      .isVisible();
    await expect(page.locator(practicePage.logoutButton)).toHaveCSS(
      "color",
      "rgb(165, 42, 42)",
    );
    await page.locator(practicePage.logoutButton).click();
    await page.waitForLoadState("domcontentloaded");
    await practicePage.loginButton.isVisible();
  });
});

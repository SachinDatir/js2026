// import { test } from "@playwright/test";
// import fs from "node:fs";
// import path from "node:path";
// import { LoginPage } from "../../pages/auth/LoginPage";

// const authStatePath = path.resolve("playwright/.auth/microsoft.json");

// test.describe("Microsoft login", () => {
//   let loginPage: LoginPage;

//   test("Login with Microsoft", async ({ page }) => {
//     fs.mkdirSync(path.dirname(authStatePath), { recursive: true });

//     loginPage = new LoginPage(page);
//     await page.goto("https://development.oneselect.global/auth/login");
//     await loginPage.expectLoaded();
//     await loginPage.emailInput.fill("itsoftware16@stulzservice.in");
//     await loginPage.loginButton.click();

//     // Enter the Microsoft password and complete MFA manually, then resume here.
//     await page.pause();
//     await page.waitForURL("**/app/**", { timeout: 60_000 });
//     await page.context().storageState({ path: authStatePath });
//   });
// });

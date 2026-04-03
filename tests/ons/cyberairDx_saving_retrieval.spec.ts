import { test, expect } from "@playwright/test";
import { generateLoginToken } from "../../support/ons-helper";
import { loginAndValidate } from "../../support/registration-utils";

const email = process.env.EMAIL!;
const password = process.env.PASSWORD!;

test.describe("CyberAirDx Saving and Retrieval", () => {
  let loginTokenResponse: unknown;

  test.beforeEach(async ({ page, request }) => {
    await test.step("Navigate to the login page", async () => {
      await page.goto("/");
    });

    loginTokenResponse = await generateLoginToken(request, email, password);
    console.log(loginTokenResponse);
  });

  test("should generate login token and open app", async ({ page }) => {
    expect(loginTokenResponse).toBeTruthy();
    await expect(page).toHaveTitle("OneSelect | STULZ");
    await loginAndValidate(page, email, password);
    await page.pause()
  });
});

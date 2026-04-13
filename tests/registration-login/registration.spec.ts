import { test, expect } from "@playwright/test";
import {
  generateUniqueEmail,
  generateRandomPassword,
} from "../../support/utils/data-generator";
import { faker } from "@faker-js/faker";
test.beforeEach(async ({ page }) => {
  const registerButton = '[href="/auth/registration"]';

  await page.goto("http://localhost:4200/", { waitUntil: "load" });
  await page.locator(registerButton).isEnabled();
  await page.waitForTimeout(1000);
});

test("Validate the registration functionality", async ({ page }) => {
  const registerButton = '[href="/auth/registration"]';

  const gdprCheckBox = "#GDPRReadWarning";
  const email = generateUniqueEmail(10, 100);
  await page.locator(registerButton).click({ force: true });

  await page.getByText("Registration").isVisible();
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").selectOption({ label: "Stulz Germany" });
  await page.locator(gdprCheckBox).check();
  await page.locator(gdprCheckBox).isChecked();
  await page.waitForTimeout(1000);
  const responsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/v1/globals/auth/initiateRegistration") &&
      res.status() === 200,
  );
  await page.waitForTimeout(1000);

  await page.locator('[type="submit"]').click({ timeout: 4000 });

  const warning = page.getByRole("dialog", { name: "warning" });

  try {
    if (await warning.isVisible({ timeout: 2000 })) {
      await page.getByRole("button", { name: "OK" }).click();
    }
  } catch (e) {
    // popup not present → ignore
  }

  const response = await responsePromise;
  const data = await response.json();

  console.log(data);
  expect(data.message).toEqual("OTP sent to registered email adress.");
  const typeOtp = async (...fields: string[]) => {
    for (let i = 0; i < fields.length; i++) {
      await page.locator(`[formcontrolname="digit${i + 1}"]`).fill(fields[i]);
    }
  };

  await typeOtp("1", "2", "3", "4", "5");

  await page.locator('[name="firstname"]').fill("Sachin");
  await page.locator('[name="lastname"]').fill("Datir");
  await page.locator("#password").fill("Sachin@123");
  await page.locator('[name="confirmPassword"]').fill("Sachin@123");
  const verifyOtp = page.waitForResponse(
    (response) =>
      response.url().includes("/verifyOTP") && response.status() === 200,
  );
  await page.waitForTimeout(1000);

  await page.locator(" .register-btn").isVisible();
  await page.locator(" .register-btn").click({ force: true });

  const verifyOtpRes = await verifyOtp;
  const resData = await verifyOtpRes.json();

  console.log(resData, ">>>>>>>>>>");

  const verifySignUp = page.waitForResponse(
    (response) =>
      response.url().includes("/verifyUserAndRegister") &&
      response.status() === 200,
  );
  await page.getByText("Agree & Sign Up").scrollIntoViewIfNeeded();
  await page.getByText("Agree & Sign Up").click({ force: true });
  const verifySignUpRes = await verifySignUp;
  const verifySignData = await verifySignUpRes.json();
  expect(verifySignData.message).toEqual(
    "Profile verified, Awaiting for approval!",
  );
  //   [name="lastname"]
  // password
  // [name="confirmPassword"]
  // .register-btn
  await page.pause();
});

test("should not be able to proceed with only email or organization", async ({
  page,
}) => {
  const email = generateUniqueEmail(20, 90);
  const registerButton = '[href="/auth/registration"]';
  await page.locator(registerButton).click({ force: true });

  await page.getByText("Registration").isVisible();
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  expect(await page.locator('[type="submit"]').isDisabled()).toBe(true);

  // await page.pause();
  // await page.locator("");
});

test.only("Validate the chiller partload calculation Compressor Step (%) functionality", async ({
  page,
}) => {
  const checkOAuth = page.waitForResponse(
    (response) =>
      response.url().includes("checkOAuthUser") && response.status() == 200,
  );

  const login = page.waitForResponse(
    (response) =>
      response.url().includes("auth/login") && response.status() == 200,
  );
  const performAllCal = page.waitForResponse(
    (response) =>
      response.url().includes("performCalculation") && response.status() == 200,
  );

  await page.locator('[name="email"]').fill("datirsachin61@gmail.com");
  await page.locator(".login-btn").isVisible();
  await page.locator(".login-btn").click();
  const authRes = await checkOAuth;
  expect(authRes).toBeTruthy();
  const auth = await authRes.json();
  if (auth.data.userMaster.authProvider == "NATIVE") {
    expect(auth.message).toEqual("Data found");
    await page.locator(".login-btn").isEnabled();

    await page.locator('[name="password"]').fill("Sachin@123");
    await page.waitForTimeout(2000);
    await page.locator(".login-btn").dblclick({ force: true });
    const authLogin = await login;
    expect(authLogin).toBeTruthy();
    let resOfLogin = await authLogin.json();
    if (resOfLogin.status === "success") {
      expect(resOfLogin.message).toEqual("Login Success");
      const token = resOfLogin.data.token;
    } else if (resOfLogin.status === "error") {
      throw new Error(
        "Check your password or your account is not present or INACTIVE",
      );
    }
  }

  const chillerId = '[src="assets/img/app/app/chiller_units.png"]';
  await page.locator(chillerId).isVisible();
  await page.locator(chillerId).click();
  await page
    .locator("div")
    .filter({ hasText: /^CyberCool 2$/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Proceed" }).click({force:true});

  const perform = await performAllCal;
  const jsonRes = await perform.json();
  expect(jsonRes.status).toEqual("success")
  await page.getByTitle('Add operating point').click()
  const performOp2 = await performAllCal;
  const jsonResOp2 = await performOp2.json();
  expect(jsonResOp2.status).toEqual("success")
  await page.waitForTimeout(2000)
  await page.locator('input#inputcompressorStep').first().scrollIntoViewIfNeeded()
  await page.locator('input#inputcompressorStep').first().click()

  await page.locator('input#inputcompressorStep').first().fill("80")
  expect(jsonRes.status).toEqual("success")
  await page.locator('#inputTempIn').nth(3).isDisabled()
});

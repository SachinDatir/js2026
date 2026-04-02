import { expect } from "@playwright/test";
export function generateUniqueEmail(minimum: number, maximum: number) {
  function generateRandomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const randomUsername = "datirsachin61";
  const email = `${randomUsername}${"+"}${generateRandomNumber(
    minimum,
    maximum,
  )}@stulzservice.com`;

  return email;
}

export function generateRandomPassword(length: number) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += "Sachin@" + `${charset[randomIndex]}`;
  }

  return password;
}

export async function loginAndValidate(
  page: any,
  email: string,
  password: string,
) {
  const checkOAuth = page.waitForResponse(
    (response: any) =>
      response.url().includes("checkOAuthUser") && response.status() == 200,
  );

  const login = page.waitForResponse(
    (response: any) =>
      response.url().includes("auth/login") && response.status() == 200,
  );
  await page.locator('[name="email"]').fill(email);
  await expect(page.locator(".login-btn")).toBeVisible();
  await expect(page.locator(".login-btn")).toBeEnabled();
  await page.locator(".login-btn").click();
  const authRes = await checkOAuth;
  expect(authRes).toBeTruthy();
  const auth = await authRes.json();
  if (auth.data.userMaster.authProvider == "NATIVE") {
    expect(auth.message).toEqual("Data found");
    await page.locator(".login-btn").isEnabled();

    await page.locator('[name="password"]').fill(password);
    await page.waitForTimeout(2000);
    await expect(page.locator(".login-btn")).toBeEnabled();
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
}

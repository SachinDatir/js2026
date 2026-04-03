import { expect, type Page, type Response } from "@playwright/test";

type OAuthProvider = "NATIVE" | string;

type CheckOAuthUserResponse = {
  data?: {
    userMaster?: {
      authProvider?: OAuthProvider;
    };
  };
  message?: string;
};

type LoginResponse = {
  status?: "success" | "error" | string;
  message?: string;
  data?: {
    token?: string;
  };
};
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
  page: Page,
  email: string,
  password: string,
) {
  const emailInput = page.locator('[name="email"]');
  const passwordInput = page.locator('[name="password"]');
  const loginButton = page.locator(".login-btn");

  await emailInput.fill(email);
  await expect(loginButton).toBeVisible();
  await expect(loginButton).toBeEnabled({timeout:100000});

  const checkOAuthResponse = await submitAndWaitForResponse(
    loginButton.click(),
    page,
    "checkOAuthUser",
  );
  const authResponseBody =
    (await checkOAuthResponse.json()) as CheckOAuthUserResponse;

  expect(authResponseBody.message).toBe("Data found");

  const authProvider = authResponseBody.data?.userMaster?.authProvider;
  if (authProvider !== "NATIVE") {
    throw new Error(
      `Unsupported auth provider "${authProvider ?? "unknown"}" for ${email}`,
    );
  }

  await passwordInput.fill(password);
  await expect(loginButton).toBeEnabled();

  const loginResponse = await submitAndWaitForResponse(
    loginButton.click(),
    page,
    "auth/login",
  );
  const loginResponseBody = (await loginResponse.json()) as LoginResponse;

  if (loginResponseBody.status !== "success") {
    throw new Error(
      loginResponseBody.message ||
        "Check your password or your account is not present or INACTIVE",
    );
  }

  expect(loginResponseBody.message).toBe("Login Success");
  expect(loginResponseBody.data?.token).toBeTruthy();
}

async function submitAndWaitForResponse(
  action: Promise<unknown>,
  page: Page,
  urlPart: string,
): Promise<Response> {
  const [response] = await Promise.all([
    page.waitForResponse(
      (apiResponse) =>
        apiResponse.url().includes(urlPart) && apiResponse.status() === 200,
    ),
    action,
  ]);

  return response;
}

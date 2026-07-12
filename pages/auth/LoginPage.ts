import { expect, type Locator, type Page } from "@playwright/test";
import { submitAndWaitForResponse } from "../../support/utils/wait-utils";

type OAuthProvider = "NATIVE" | string;

export type CheckOAuthUserResponse = {
  data?: {
    userMaster?: {
      authProvider?: OAuthProvider;
    };
    outputData?:{
      unitOutput?:{}

    }
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

export class LoginPage {
  private readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.loginButton = page.locator(".login-btn");
    this.signUpLink = page.locator('[href="/auth/registration"]');
  }

  async open() {
    await this.page.goto("/");
    await this.page.waitForURL("**/auth/login")
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.signUpLink).toBeEnabled();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectAppOpened() {
    await expect(this.page).toHaveTitle("OneSelect | STULZ");
  }

  async loginAndValidate(email: string, password: string) {
    await this.open()
    await this.expectLoaded()
    await this.emailInput.fill(email);
    await expect(this.loginButton).toBeVisible();
    await expect(this.loginButton).toBeEnabled({ timeout: 100000 });

    const checkOAuthResponse = await submitAndWaitForResponse(
      () => this.loginButton.click(),
      this.page,
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

    await this.passwordInput.fill(password);
    await expect(this.loginButton).toBeEnabled();
    
    const loginResponse = await submitAndWaitForResponse(
      () => this.loginButton.click(),
      this.page,
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
}

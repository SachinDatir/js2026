import { type Page } from "@playwright/test";
import { LoginPage } from "../pages/auth/LoginPage";

export {
  generateRandomPassword,
  generateUniqueEmail,
} from "./utils/data-generator";

export async function loginAndValidate(
  page: Page,
  email: string,
  password: string,
) {
  const loginPage = new LoginPage(page);
  await loginPage.loginAndValidate(email, password);
}

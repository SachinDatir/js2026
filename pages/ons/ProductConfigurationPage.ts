import { expect, type Locator, type Page } from "@playwright/test";

export class ProductConfigurationPage {
  private readonly page: Page;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedButton = page.getByRole("button", { name: "Proceed" });
  }

  modelCard(modelName: string) {
    return this.page.getByRole('heading', { name: modelName, exact: true });
  }

  async selectModel(modelName: string) {
    await this.modelCard(modelName).scrollIntoViewIfNeeded();
    await expect(this.modelCard(modelName)).toBeVisible();
    await this.modelCard(modelName).click();
  }

  async proceed() {
    await this.proceedButton.click();
  }
}

import { type Locator, type Page } from "@playwright/test";

export class ModelResultTableComponent {
  private readonly page: Page;
  readonly modelPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modelPanel = page.getByText("MODEL", { exact: true });
  }

  modelValue(value: string) {
    return this.page.getByText(value, { exact: true });
  }
}

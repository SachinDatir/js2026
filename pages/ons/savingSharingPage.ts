import { type Page, type Locator } from "@playwright/test";
import { parseEnv } from "util";
export class SavingPage {
  private readonly page: Page;
  readonly saveButton: Locator;
  readonly saveConfigModel: Locator;
  readonly modelTitle: string;
  readonly projectDropDown: string;
  readonly saveButtonInModel: Locator;
  readonly shareConfigButton: Locator;
  readonly suggestedUserList: string;
  readonly shareConfigModelButton: Locator;

  constructor(page: Page) {
    ((this.page = page), (this.saveButton = page.locator("a .bxs-save")));
    this.saveConfigModel = page.locator("#saveEditConfigModal");
    this.modelTitle = ".modal-title";
    this.projectDropDown = "#ProjectDropdown";
    this.saveButtonInModel = page.getByRole("button", { name: "Save" });
    this.shareConfigButton = page.locator(
      '[title="Share configuration"] > span',
    );
    this.suggestedUserList = '[class="mb-0 fw-bold"]';
    this.shareConfigModelButton = page.getByRole("button", {
      name: "Share configuration",
    });
  }
}

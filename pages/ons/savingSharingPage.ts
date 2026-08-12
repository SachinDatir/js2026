import { type Page, type Locator, expect } from "@playwright/test";
import { parseEnv } from "util";
import { submitAndWaitForResponse } from "../../support/utils/wait-utils";
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
  readonly saveModelArrowButton: string;

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
    this.saveModelArrowButton = "div>div>.bxs-down-arrow";
  }

  async saveConfiguration(projectName: string, configurationName: string) {
    await this.saveButton.click();
    await this.saveConfigModel.waitFor({ state: "visible" });
    await expect(
      this.page.getByRole("heading", { name: "Save Configuration" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "Save Configuration" }),
    ).toContainText("Save Configuration");

    const dropdownContainer = this.page.locator(this.projectDropDown);
    await this.page.waitForTimeout(2000);
    await this.page.locator(".form-control.d-flex").click({ force: true });
    await this.page.waitForSelector(this.projectDropDown, { state: "visible" });

    await expect(this.page.locator(this.projectDropDown)).toBeVisible();
    const dropdownValues = await dropdownContainer
      .locator(".list-project")
      .allTextContents();

    const uniqueDropdowns = [...new Set(dropdownValues.map((t) => t.trim()))];

    const targetProject = projectName;
    for (const project of uniqueDropdowns) {
      if (project === targetProject) {
        console.log(`Match found! Clicking on: ${project}`);
        await dropdownContainer
          .getByText(project, { exact: true })
          .first()
          .click({ force: true });

        break;
      }
    }

    await this.page
      .getByRole("textbox", { name: "Configuration name" })
      .fill(configurationName);
  
          const saveConfigResponse = await submitAndWaitForResponse(
            () => this.saveButtonInModel.click(),
            this.page,
            "saveConfiguration",
          );
    
          expect(saveConfigResponse.status()).toBe(200);
    
          const shareBtn = this.shareConfigButton;
    
          await expect(shareBtn).toBeVisible();
          await expect(shareBtn).toBeEnabled();

  }
}

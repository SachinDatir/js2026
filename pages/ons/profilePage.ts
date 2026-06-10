import { type Locator, type Page } from "@playwright/test";
export class ProfilePage {
  private readonly page: Page;
  readonly profileButton: Locator;
  readonly profileTab:Locator
  readonly userManagement:Locator
  readonly tabList :Locator
  readonly preferredUnit: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.profileButton = page.locator(".menu-profile");
    this.profileTab = page.locator("li>a>.bx-user")
    this.userManagement = page.locator("li>a>.bx-group")
    this.tabList = page.locator('ul[role="tablist"]>li>a')
    this.preferredUnit = page.locator('select#preferredUnit')
    this.saveButton = page.locator("#btn-settings-save")
  }
}

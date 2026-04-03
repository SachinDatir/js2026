import { type Locator, type Page } from "@playwright/test";

export class HeaderComponent {
  readonly helpIcon: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.helpIcon = page.getByTitle("Help");
    this.userMenu = page.locator("text=Hi,");
  }
}

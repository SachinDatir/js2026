import { type Locator, type Page } from "@playwright/test";

export class SideMenuComponent {
  readonly myProjectsTab: Locator;
  readonly mySettingsTab: Locator;
  readonly toolsTab: Locator;

  constructor(page: Page) {
    this.myProjectsTab = page.getByText("My Projects");
    this.mySettingsTab = page.getByText("My Settings");
    this.toolsTab = page.getByText("Tools");
  }
}

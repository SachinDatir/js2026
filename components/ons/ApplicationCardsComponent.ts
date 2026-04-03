import { type Page } from "@playwright/test";

export class ApplicationCardsComponent {
  constructor(private readonly page: Page) {}

  applicationCard(name: string) {
    return this.page.getByTitle(name);
  }

  async openApplication(name: string) {
    await this.applicationCard(name).click();
  }
}

import { type Locator, type Page } from "@playwright/test";
import { waitForApi } from "../../support/utils/wait-utils";

export class ProductLinePage {
  private readonly page: Page;
  readonly cyberAirCard: Locator;
  readonly cyberCool2Card: Locator;
  readonly cyberLabCard: Locator;
  readonly systemCooling: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cyberAirCard = page
      .locator("#DEU")
      .getByRole("heading", { name: "CyberAir", exact: true });
    this.cyberCool2Card = page
      .locator("#DEU")
      .getByRole("heading", { name: "CyberCool 2" });
    this.cyberLabCard = page
      .locator("#DEU")
      .getByRole("heading", { name: "CyberLab" });
    this.systemCooling = page.locator("#systemCooling");
  }

  async selectCyberAir() {
    await this.cyberAirCard.click();
    await waitForApi(this.page, "/listFilteredModels");
  }

  async selectCyberCool2() {
    await this.cyberCool2Card.click();
  }

  async selectCyberLab() {
    await this.cyberLabCard.click();
  }

  // async selectCoolingSystem(systemName: string) {
  //   await this.systemCooling.getByRole('heading', { name: systemName, exact: true }).click();
  // }
}

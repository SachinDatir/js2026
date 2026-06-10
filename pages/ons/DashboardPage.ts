import { expect, type Locator, type Page } from "@playwright/test";

export class DashboardPage {
  private readonly page: Page;
  readonly roomCoolingCard: Locator;
  readonly chillerCard: Locator;
  readonly proceedButton: Locator;
  readonly cyberAirMiniCard: Locator
  readonly roomCoolingDeuProductLine: Locator;

  constructor(page: Page) {
    this.page = page;
    this.roomCoolingCard = page.getByRole("heading", { name: "Room Cooling" });
    this.chillerCard = page.locator(
      '[src="assets/img/app/app/chiller_units.png"]',
    );
    this.proceedButton = page.locator("#modelSelectionProceed");
    this.cyberAirMiniCard = page.getByRole("heading", { name: "CyberAir Mini" });
    this.roomCoolingDeuProductLine = page.locator("#DEU");
  }

  async openRoomCooling() {
    await expect(this.roomCoolingCard).toBeVisible();
    await this.roomCoolingCard.click();
  }

  async openChiller() {
    await this.chillerCard.click();
  }

  async proceed() {
    await this.proceedButton.click();
  }
  async selectCyberAirMini() {
    await this.roomCoolingDeuProductLine.locator(this.cyberAirMiniCard).click();
  }
}

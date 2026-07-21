import { expect, type Locator, type Page } from "@playwright/test";

export class DashboardPage {
  private readonly page: Page;
  readonly roomCoolingCard: Locator;
  readonly chillerCard: Locator;
  readonly proceedButton: Locator;
  readonly cyberAirMiniCard: Locator;
  readonly roomCoolingDeuProductLine: Locator;
  readonly shelterCoolingCard: Locator;
  readonly deuProductLine: Locator;
  readonly splitAirCard: Locator;
  readonly dischargeType: Locator;
  readonly systemCooling: Locator;
  readonly compressorType: Locator;
  readonly CyberAirCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.roomCoolingCard = page.getByRole("heading", { name: "Room Cooling" });
    this.chillerCard = page.locator(
      '[src="assets/img/app/app/chiller_units.png"]',
    );
    this.proceedButton = page.locator("#modelSelectionProceed");
    this.cyberAirMiniCard = page.getByRole("heading", {
      name: "CyberAir Mini",
    });
    this.roomCoolingDeuProductLine = page.locator("#DEU");
    this.deuProductLine = page.locator("#DEU");
    this.shelterCoolingCard = page.getByRole("heading", {
      name: "Shelter Cooling",
    });
    this.splitAirCard = page.getByRole("heading", { name: "SplitAir" });
    this.CyberAirCard = page.getByRole("heading", {
      name: "CyberAir",
      exact: true,
    });
    this.systemCooling = page.locator("#systemCooling");

    this.dischargeType = page.locator("#dischargeType");
    this.compressorType = page.locator("#compressorType");
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

  async selectShelterCooling() {
    await expect(this.shelterCoolingCard).toBeVisible();
    await this.shelterCoolingCard.click();
  }

  async selectProductLine(country: Locator, productLine: Locator) {
    await country.locator(productLine).click();
  }

  async selectDischargeType(disType: string) {
    await this.dischargeType
      .locator(this.page.getByRole("heading", { name: disType, exact: true }))
      .click();
  }

  async selectCoolingSystem(systemName: string) {
    await this.systemCooling
      .getByRole("heading", { name: systemName, exact: true })
      .click();
  }

  async selectCompressorType(compressorType: string) {
    let compressor = this.compressorType.getByRole("heading", {
      name: compressorType,
      exact: true,
    });
    await compressor.scrollIntoViewIfNeeded();
    await compressor.click({ force: true });
  }

  modelCard(modelName: string) {
    return this.page.getByRole("heading", { name: modelName, exact: true });
  }

  async selectModel(modelName: string) {
    await this.modelCard(modelName).scrollIntoViewIfNeeded();
    await expect(this.modelCard(modelName)).toBeVisible();
    await this.modelCard(modelName).click();
  }
}

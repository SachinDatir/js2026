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
  readonly cciIndoor: Locator;
  readonly cc2Card: Locator;
  readonly cyberLabCard: Locator;

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
    this.cciIndoor = page.getByRole("heading", {
      name: "CyberCool Indoor",
      exact: true,
    });
    this.cc2Card = page.getByRole("heading", {
      name: "CyberCool 2",
      exact: true,
    });

    this.cyberLabCard = this.deuProductLine.getByRole("heading", {
      name: "CyberLab",exact: true
    });
  }

  async openRoomCooling() {
    await expect(this.roomCoolingCard).toBeVisible({timeout: 50000});
    await this.roomCoolingCard.click();
  }

  async openChiller() {
    await this.chillerCard.click();
  }

  async openCyberLab() {
    await this.openRoomCooling();
    await expect(this.cyberLabCard).toBeVisible();
    await this.cyberLabCard.click();
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

  async selectCoolingType(coolingType: string) {
    let cooling = this.page.getByRole("heading", {
      name: coolingType,
      exact: true,
    });
    await cooling.scrollIntoViewIfNeeded();
    await cooling.click({ force: true });
  }
  async selectCasingSize(casingSize: string) {
    let caseSize = this.page.getByRole("heading", {
      name: casingSize,
      exact: true,
    });
    await caseSize.scrollIntoViewIfNeeded();
    await caseSize.click({ force: true });
  }

  modelCard(modelName: string) {
    return this.page.getByRole("heading", { name: modelName, exact: true });
  }

  async selectModel(modelName: string) {
    await this.modelCard(modelName).scrollIntoViewIfNeeded();
    await expect(this.modelCard(modelName)).toBeVisible();
    await this.modelCard(modelName).click();
  }

  async selectNoiseData(noiseData: string) {
    let noise = this.page.getByRole("heading", {
      name: noiseData,
      exact: true,
    });
    await noise.scrollIntoViewIfNeeded();
    await expect(noise).toBeVisible();
    await noise.click({ force: true });
  }

  async selectRefrigerantType(refrigerantType: string) {
    let refrigerant = this.page.getByRole("heading", {
      name: refrigerantType,
      exact: true,
    });
    await refrigerant.scrollIntoViewIfNeeded();
    await expect(refrigerant).toBeVisible();
    await refrigerant.click({ force: true });
  }

  async selectPowerSupply(powerSupply: string) {
    let powerSupplyOption = this.page.getByRole("heading", {
      name: powerSupply,
      exact: true,
    });
    // await powerSupplyOption.scrollIntoViewIfNeeded();
    await expect(powerSupplyOption).toBeVisible();
    await powerSupplyOption.click({ force: true });
  }
}

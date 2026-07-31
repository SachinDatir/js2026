import { expect, type Locator, type Page } from "@playwright/test";
import { m3hToCfm, kwToMbh, roundTo } from "../../support/utils/unit-converter";

export class InputPage {
  readonly page: Page;
  readonly inputAirFlow: Locator;
  readonly externalStaticPressure: Locator;
  readonly inputProductLine: Locator;
  readonly ERDbutton: Locator;
  readonly coolingCapacity: Locator;
  readonly ocsButton: Locator;
  readonly annualEnergyConsumption: Locator;
  readonly operatingPointButton: Locator;
  readonly lphwReheatButton :Locator
  readonly inputPowerSupply :Locator
  readonly inputReturnAirTemp :Locator
  readonly inputRelHum :Locator
  readonly inputCoolingSys : Locator

  constructor(page: Page) {
    this.page = page;
    this.inputAirFlow = page.locator("input#inputAirFlow");
    this.externalStaticPressure = page.locator("input#inputExt");
    this.inputProductLine = page.locator("#inputProductLine");
    this.ERDbutton = page.locator('a[title="Electrical Data Sheet"]');
    this.coolingCapacity = page.locator('[for="coolingCapacity"]').last();
    this.ocsButton = page.locator("#ocsButton");
    this.annualEnergyConsumption = page.locator("#ocsAnnualEnergyConsumption");
    this.operatingPointButton = page.locator("#operatingPointBtn");
    this.lphwReheatButton = page.locator("#lphwReheat")
    this.inputPowerSupply = page.locator("#inputPowerSupply")
    this.inputReturnAirTemp = page.locator("input#inputRet")
    this.inputRelHum = page.locator("input#inputRelHum")
    this.inputCoolingSys = page.locator("#inputCoolingSys")
  }

  async enterAirFlow(airFlowValue: string) {
    await this.inputAirFlow.first().click();
    await this.inputAirFlow.first().fill(airFlowValue);
    await this.inputAirFlow.first().press("Enter");
  }

  async InputParameter(locator: Locator, value: string) {
    await locator.first().click({ force: true });
    await locator.first().fill(value);
    await locator.first().press("Enter");
    const rawReceivedValue = await locator.first().inputValue();
    //  await this.page.pause()
    const cleanReceivedValue = rawReceivedValue.replace(/,/g, "").split(".").join("")
     console.log(cleanReceivedValue,"cleanReceivedValue")
    //  await expect(cleanReceivedValue).toBe(value);
  }

  async expectParameterValue(locator: Locator, value: string) {
    await expect(locator.last()).toHaveValue(value);
    console.log(`Verified that the parameter value is ${value}`);
  }

  /**
   * Extract numeric value from a UI element
   */
  async extractNumericValue(locator: Locator): Promise<number> {
    const text = await locator.textContent();
    if (!text) {
      throw new Error("Locator has no text content");
    }
    const match = text.match(/[\d.]+/);
    if (!match) {
      throw new Error(`Could not extract numeric value from: ${text}`);
    }
    return parseFloat(match[0]);
  }

  /**
   * Validate SI to US conversion for Air Flow in UI
   * @param siValue - Air flow in m³/h
   * @param usDisplayLocator - Locator for the US format displayed value (CFM)
   */
  async validateAirFlowConversion(
    siValue: number,
    usDisplayLocator: Locator,
  ): Promise<void> {
    const expectedCfm = roundTo(m3hToCfm(siValue));
    const displayedCfm = await this.extractNumericValue(usDisplayLocator);

    expect(displayedCfm).toBe(expectedCfm);
    console.log(
      `✓ Air Flow: ${siValue} m³/h = ${expectedCfm} CFM (displayed: ${displayedCfm})`,
    );
  }

  /**
   * Validate SI to US conversion for Cooling Capacity in UI
   * @param siValue - Cooling capacity in kW
   * @param usDisplayLocator - Locator for the US format displayed value (MBH)
   */
  async validateCoolingCapacityConversion(
    siValue: number,
    usDisplayLocator: Locator,
  ): Promise<void> {
    const expectedMbh = roundTo(kwToMbh(siValue), 1);
    const displayedMbh = await this.extractNumericValue(usDisplayLocator);

    expect(displayedMbh).toBe(expectedMbh);
    console.log(
      `✓ Cooling Capacity: ${siValue} kW = ${expectedMbh} MBH (displayed: ${displayedMbh})`,
    );
  }

  /**
   * Get all parameter values from the results panel/table
   * Returns an object with parameter names and their values
   */
  async getResultsTableValues(): Promise<{ [key: string]: number }> {
    const results: { [key: string]: number } = {};

    // Adjust selector based on your actual results table/panel structure
    const resultRows = await this.page
      .locator('[class*="result"] tr, [class*="result"] .row')
      .all();

    for (const row of resultRows) {
      const labelText = await row
        .locator("td:first-child, .label")
        .textContent();
      const valueText = await row
        .locator("td:last-child, .value")
        .textContent();

      if (labelText && valueText) {
        const label = labelText.trim();
        const match = valueText.match(/[\d.]+/);
        if (match) {
          results[label] = parseFloat(match[0]);
        }
      }
    }

    return results;
  }
}

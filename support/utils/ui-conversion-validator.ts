import { expect, type Locator, type Page } from "@playwright/test";
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  m3hToCfm,
  cfmToM3h,
  pascalsToInWg,
  inWgToPascals,
  kwToMbh,
  mbhToKw,
  kgToLb,
  lbToKg,
  metersToInches,
  eerToCop,
  copToEer,
  roundTo,
  areValuesEqualWithinPercent,
} from "./unit-converter";

/**
 * UI Validation Helper for SI ↔ US Format Conversions
 * Extracts values from UI, converts them, and validates against displayed values
 */
export class UIConversionValidator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Extract numeric value from a UI element's text content
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
   * Extract numeric value from an input field
   */
  async extractInputValue(locator: Locator): Promise<number> {
    const value = await locator.inputValue();
    if (!value) {
      throw new Error("Input field has no value");
    }
    return parseFloat(value);
  }

  /**
   * Validate Temperature conversion in UI
   * @example
   * // If UI shows both SI (°C) and US (°F) values
   * await validator.validateTemperature(celsiusLocator, fahrenheitLocator);
   */
  async validateTemperature(
    celsiusLocator: Locator,
    fahrenheitLocator: Locator,
    tolerance: number = 1,
  ): Promise<void> {
    const celsius = await this.extractNumericValue(celsiusLocator);
    const fahrenheitUI = await this.extractNumericValue(fahrenheitLocator);
    const fahrenheitConverted = celsiusToFahrenheit(celsius);

    const isValid = areValuesEqualWithinPercent(
      fahrenheitUI,
      fahrenheitConverted,
      tolerance,
    );

    console.log(`Temperature Validation: ${celsius}°C`);
    console.log(`  UI Shows: ${fahrenheitUI}°F`);
    console.log(`  Converted: ${roundTo(fahrenheitConverted)}°F`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Air Flow conversion in UI
   * @example
   * // If UI shows both SI (m³/h) and US (CFM) values
   * await validator.validateAirFlow(m3hLocator, cfmLocator);
   */
  async validateAirFlow(
    m3hLocator: Locator,
    cfmLocator: Locator,
    tolerance: number = 2,
  ): Promise<void> {
    const m3h = await this.extractNumericValue(m3hLocator);
    const cfmUI = await this.extractNumericValue(cfmLocator);
    const cfmConverted = m3hToCfm(m3h);

    const isValid = areValuesEqualWithinPercent(cfmUI, cfmConverted, tolerance);

    console.log(`Air Flow Validation: ${m3h} m³/h`);
    console.log(`  UI Shows: ${cfmUI} CFM`);
    console.log(`  Converted: ${roundTo(cfmConverted)} CFM`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Pressure conversion in UI
   * @example
   * // If UI shows both SI (Pa) and US (in.wg) values
   * await validator.validatePressure(pascalsLocator, inWgLocator);
   */
  async validatePressure(
    pascalsLocator: Locator,
    inWgLocator: Locator,
    tolerance: number = 5,
  ): Promise<void> {
    const pascals = await this.extractNumericValue(pascalsLocator);
    const inWgUI = await this.extractNumericValue(inWgLocator);
    const inWgConverted = pascalsToInWg(pascals);

    const isValid = areValuesEqualWithinPercent(inWgUI, inWgConverted, tolerance);

    console.log(`Pressure Validation: ${pascals} Pa`);
    console.log(`  UI Shows: ${inWgUI} in.wg`);
    console.log(`  Converted: ${roundTo(inWgConverted, 3)} in.wg`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Cooling Capacity conversion in UI
   * @example
   * // If UI shows both SI (kW) and US (MBH) values
   * await validator.validateCoolingCapacity(kwLocator, mbhLocator);
   */
  async validateCoolingCapacity(
    kwLocator: Locator,
    mbhLocator: Locator,
    tolerance: number = 1,
  ): Promise<void> {
    const kw = await this.extractNumericValue(kwLocator);
    const mbhUI = await this.extractNumericValue(mbhLocator);
    const mbhConverted = kwToMbh(kw);

    const isValid = areValuesEqualWithinPercent(mbhUI, mbhConverted, tolerance);

    console.log(`Cooling Capacity Validation: ${kw} kW`);
    console.log(`  UI Shows: ${mbhUI} MBH`);
    console.log(`  Converted: ${roundTo(mbhConverted, 1)} MBH`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Weight conversion in UI
   * @example
   * // If UI shows both SI (kg) and US (lb) values
   * await validator.validateWeight(kgLocator, lbLocator);
   */
  async validateWeight(
    kgLocator: Locator,
    lbLocator: Locator,
    tolerance: number = 1,
  ): Promise<void> {
    const kg = await this.extractNumericValue(kgLocator);
    const lbUI = await this.extractNumericValue(lbLocator);
    const lbConverted = kgToLb(kg);

    const isValid = areValuesEqualWithinPercent(lbUI, lbConverted, tolerance);

    console.log(`Weight Validation: ${kg} kg`);
    console.log(`  UI Shows: ${lbUI} lb`);
    console.log(`  Converted: ${roundTo(lbConverted)} lb`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Dimensions conversion in UI
   * @example
   * // If UI shows both SI (m) and US (in) values
   * await validator.validateDimension(metersLocator, inchesLocator);
   */
  async validateDimension(
    metersLocator: Locator,
    inchesLocator: Locator,
    dimensionName: string = "Dimension",
    tolerance: number = 2,
  ): Promise<void> {
    const meters = await this.extractNumericValue(metersLocator);
    const inchesUI = await this.extractNumericValue(inchesLocator);
    const inchesConverted = metersToInches(meters);

    const isValid = areValuesEqualWithinPercent(
      inchesUI,
      inchesConverted,
      tolerance,
    );

    console.log(`${dimensionName} Validation: ${meters} m`);
    console.log(`  UI Shows: ${inchesUI} in`);
    console.log(`  Converted: ${roundTo(inchesConverted)} in`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Validate Energy Efficiency conversion in UI
   * @example
   * // If UI shows both SI (COP) and US (EER) values
   * await validator.validateEnergyEfficiency(copLocator, eerLocator);
   */
  async validateEnergyEfficiency(
    copLocator: Locator,
    eerLocator: Locator,
    tolerance: number = 2,
  ): Promise<void> {
    const cop = await this.extractNumericValue(copLocator);
    const eerUI = await this.extractNumericValue(eerLocator);
    const eerConverted = copToEer(cop);

    const isValid = areValuesEqualWithinPercent(eerUI, eerConverted, tolerance);

    console.log(`Energy Efficiency Validation: ${cop} COP`);
    console.log(`  UI Shows: ${eerUI} EER`);
    console.log(`  Converted: ${roundTo(eerConverted, 2)} EER`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Generic validation for any numeric parameter
   * Manually specify conversion function and units
   * @example
   * await validator.validateParameter(
   *   siLocator,
   *   usLocator,
   *   m3hToCfm,
   *   "Air Flow",
   *   "m³/h",
   *   "CFM"
   * );
   */
  async validateParameter(
    siLocator: Locator,
    usLocator: Locator,
    conversionFn: (value: number) => number,
    parameterName: string,
    siUnit: string,
    usUnit: string,
    tolerance: number = 2,
  ): Promise<void> {
    const siValue = await this.extractNumericValue(siLocator);
    const usValueUI = await this.extractNumericValue(usLocator);
    const usValueConverted = conversionFn(siValue);

    const isValid = areValuesEqualWithinPercent(
      usValueUI,
      usValueConverted,
      tolerance,
    );

    console.log(`${parameterName} Validation: ${siValue} ${siUnit}`);
    console.log(`  UI Shows: ${usValueUI} ${usUnit}`);
    console.log(`  Converted: ${roundTo(usValueConverted, 2)} ${usUnit}`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }

  /**
   * Extract all numeric values from a table row
   * Useful for validating multiple parameters at once
   */
  async extractTableRowValues(tableRowLocator: Locator): Promise<number[]> {
    const cells = await tableRowLocator.locator("td, th").all();
    const values: number[] = [];

    for (const cell of cells) {
      const text = await cell.textContent();
      if (text) {
        const match = text.match(/[\d.]+/);
        if (match) {
          values.push(parseFloat(match[0]));
        }
      }
    }

    return values;
  }

  /**
   * Validate a specific cell value in a results table
   * @example
   * await validator.validateTableCell(
   *   resultTableLocator,
   *   "Air flow",
   *   2060,
   *   "CFM"
   * );
   */
  async validateTableCell(
    tableLocator: Locator,
    parameterName: string,
    expectedValue: number,
    unit: string,
    tolerance: number = 2,
  ): Promise<void> {
    // Try to find the row containing the parameter name
    const parameterRow = tableLocator
      .locator(`text=${parameterName}`)
      .first();

    await expect(parameterRow).toBeVisible();

    // Get the value cell (usually the next column)
    const valueCell = parameterRow.locator("..").locator("td, span").last();
    const actualValue = await this.extractNumericValue(valueCell);

    const isValid = areValuesEqualWithinPercent(
      actualValue,
      expectedValue,
      tolerance,
    );

    console.log(`Table Validation: ${parameterName}`);
    console.log(`  Expected: ${expectedValue} ${unit}`);
    console.log(`  Actual: ${actualValue} ${unit}`);
    console.log(`  Valid: ${isValid}`);

    expect(isValid).toBe(true);
  }
}

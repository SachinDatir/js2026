import { expect, type Locator } from "@playwright/test";
import {
  siToUsConversion,
  usToSiConversion,
  convertWithUnits,
  getUnitInfo,
  type ConversionTag,
} from "./si-us-converter";

/**
 * UI Value Extraction and Conversion Validator
 * Extracts numeric values from locators and converts between SI and US formats
 */
export class SiUsUIValidator {
  /**
   * Extract numeric value from a locator's text content
   * @param locator - Playwright locator
   * @returns Extracted numeric value
   */
  static async extractNumericValue(locator: Locator): Promise<number> {
    const text = await locator.textContent();
    if (!text) {
      throw new Error("Locator has no text content");
    }

    // Match numbers including decimals
    const match = text.match(/[\d.]+/);
    if (!match) {
      throw new Error(`Could not extract numeric value from: "${text}"`);
    }

    return parseFloat(match[0]);
  }

  /**
   * Extract numeric value from an input field
   * @param locator - Input field locator
   * @returns Extracted numeric value
   */
  static async extractInputValue(locator: Locator): Promise<number> {
    const value = await locator.inputValue();
    if (!value) {
      throw new Error("Input field has no value");
    }
    return parseFloat(value);
  }

  /**
   * Extract SI value from locator and convert to US format
   * @param tag - Conversion tag (parameter identifier)
   * @param siLocator - Locator containing the SI value
   * @returns Converted US format value
   * @example
   * const usValue = await validator.extractAndConvertToUs('airFlow', siLocator);
   * console.log(usValue); // "2060"
   */
  static async extractAndConvertToUs(
    tag: ConversionTag,
    siLocator: Locator,
  ): Promise<string> {
    const siValue = await this.extractNumericValue(siLocator);
    return siToUsConversion(tag, siValue);
  }

  /**
   * Extract US value from locator and convert to SI format
   * @param tag - Conversion tag
   * @param usLocator - Locator containing the US value
   * @returns Converted SI format value
   */
  static async extractAndConvertToSi(
    tag: ConversionTag,
    usLocator: Locator,
  ): Promise<string> {
    const usValue = await this.extractNumericValue(usLocator);
    return usToSiConversion(tag, usValue);
  }

  /**
   * Validate that SI value in one locator converts correctly to displayed US value
   * @param tag - Conversion tag
   * @param siLocator - Locator with SI format value
   * @param usDisplayLocator - Locator with expected US format value
   * @param tolerance - Percentage tolerance for comparison (default 1%)
   * @example
   * await validator.validateSiToUsConversion(
   *   'airFlow',
   *   page.locator('text=3500'),  // 3500 m³/h
   *   page.locator('text=2060')   // 2060 CFM
   * );
   */
  static async validateSiToUsConversion(
    tag: ConversionTag,
    siLocator: Locator,
    usDisplayLocator: Locator,
    tolerance: number = 1,
  ): Promise<void> {
    const siValue = await this.extractNumericValue(siLocator);
    const usDisplayed = await this.extractNumericValue(usDisplayLocator);
    const usConverted = parseFloat(siToUsConversion(tag, siValue));

    const units = getUnitInfo(tag);
    const percentDiff = Math.abs((usDisplayed - usConverted) / usConverted) * 100;
    const isValid = percentDiff <= tolerance;

    console.log(
      `Conversion: ${siValue} ${units.si} → ${usConverted} ${units.us} (displayed: ${usDisplayed} ${units.us})`,
    );
    console.log(
      `Tolerance: ${tolerance}%, Actual diff: ${percentDiff.toFixed(2)}% - ${isValid ? "✓ PASS" : "✗ FAIL"}`,
    );

    expect(isValid).toBe(true);
  }

  /**
   * Validate that US value in one locator converts correctly to SI value
   * @param tag - Conversion tag
   * @param usLocator - Locator with US format value
   * @param siDisplayLocator - Locator with expected SI format value
   * @param tolerance - Percentage tolerance (default 1%)
   */
  static async validateUsToSiConversion(
    tag: ConversionTag,
    usLocator: Locator,
    siDisplayLocator: Locator,
    tolerance: number = 1,
  ): Promise<void> {
    const usValue = await this.extractNumericValue(usLocator);
    const siDisplayed = await this.extractNumericValue(siDisplayLocator);
    const siConverted = parseFloat(usToSiConversion(tag, usValue));

    const units = getUnitInfo(tag);
    const percentDiff = Math.abs((siDisplayed - siConverted) / siConverted) * 100;
    const isValid = percentDiff <= tolerance;

    console.log(
      `Conversion: ${usValue} ${units.us} → ${siConverted} ${units.si} (displayed: ${siDisplayed} ${units.si})`,
    );
    console.log(
      `Tolerance: ${tolerance}%, Actual diff: ${percentDiff.toFixed(2)}% - ${isValid ? "✓ PASS" : "✗ FAIL"}`,
    );

    expect(isValid).toBe(true);
  }

  /**
   * Extract SI value from locator and validate it matches expected US value
   * @param tag - Conversion tag
   * @param siLocator - Locator with SI format value
   * @param expectedUsValue - Expected US format value to validate against
   * @param tolerance - Percentage tolerance (default 1%)
   * @example
   * await validator.validateSiValueConvertsToExpectedUs(
   *   'airFlow',
   *   page.locator('text=3500'),
   *   2060  // Expected CFM
   * );
   */
  static async validateSiValueConvertsToExpectedUs(
    tag: ConversionTag,
    siLocator: Locator,
    expectedUsValue: number,
    tolerance: number = 1,
  ): Promise<void> {
    const siValue = await this.extractNumericValue(siLocator);
    const usConverted = parseFloat(siToUsConversion(tag, siValue));

    const units = getUnitInfo(tag);
    const percentDiff = Math.abs((usConverted - expectedUsValue) / expectedUsValue) * 100;
    const isValid = percentDiff <= tolerance;

    console.log(
      `SI Value: ${siValue} ${units.si} → Converted: ${usConverted} ${units.us}`,
    );
    console.log(
      `Expected: ${expectedUsValue} ${units.us}, Diff: ${percentDiff.toFixed(2)}% - ${isValid ? "✓ PASS" : "✗ FAIL"}`,
    );

    expect(isValid).toBe(true);
  }

  /**
   * Extract US value from locator and validate it matches expected SI value
   * @param tag - Conversion tag
   * @param usLocator - Locator with US format value
   * @param expectedSiValue - Expected SI format value to validate against
   * @param tolerance - Percentage tolerance (default 1%)
   */
  static async validateUsValueConvertsToExpectedSi(
    tag: ConversionTag,
    usLocator: Locator,
    expectedSiValue: number,
    tolerance: number = 1,
  ): Promise<void> {
    const usValue = await this.extractNumericValue(usLocator);
    const siConverted = parseFloat(usToSiConversion(tag, usValue));

    const units = getUnitInfo(tag);
    const percentDiff = Math.abs((siConverted - expectedSiValue) / expectedSiValue) * 100;
    const isValid = percentDiff <= tolerance;

    console.log(
      `US Value: ${usValue} ${units.us} → Converted: ${siConverted} ${units.si}`,
    );
    console.log(
      `Expected: ${expectedSiValue} ${units.si}, Diff: ${percentDiff.toFixed(2)}% - ${isValid ? "✓ PASS" : "✗ FAIL"}`,
    );

    expect(isValid).toBe(true);
  }

  /**
   * Get conversion result with units information
   * @param tag - Conversion tag
   * @param value - Value to convert
   * @param direction - Conversion direction (default: 'siToUs')
   * @returns Object with converted value and unit
   * @example
   * const result = SiUsUIValidator.getConversion('airFlow', 3500, 'siToUs');
   * console.log(result); // { value: "2060", unit: "CFM" }
   */
  static getConversion(
    tag: ConversionTag,
    value: number,
    direction: 'siToUs' | 'usToSi' = 'siToUs',
  ): { value: string; unit: string } {
    return convertWithUnits(tag, value, direction);
  }

  /**
   * Get unit information for a tag
   * @param tag - Conversion tag
   * @returns Object with SI and US units
   * @example
   * const units = SiUsUIValidator.getUnits('airFlow');
   * console.log(units); // { si: "m³/h", us: "CFM" }
   */
  static getUnits(tag: ConversionTag): { si: string; us: string } {
    return getUnitInfo(tag);
  }

  /**
   * Format a value with its unit for display
   * @param tag - Conversion tag
   * @param value - Numeric value
   * @param direction - Conversion direction (default: 'siToUs')
   * @returns Formatted string with value and unit
   * @example
   * console.log(SiUsUIValidator.formatWithUnit('airFlow', 3500, 'siToUs'));
   * // "2060 CFM"
   */
  static formatWithUnit(
    tag: ConversionTag,
    value: number,
    direction: 'siToUs' | 'usToSi' = 'siToUs',
  ): string {
    const result = convertWithUnits(tag, value, direction);
    return `${result.value} ${result.unit}`;
  }
}

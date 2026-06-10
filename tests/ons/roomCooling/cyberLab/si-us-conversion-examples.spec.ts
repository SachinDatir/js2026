import { test, expect, type Page } from "@playwright/test";
import { SiUsUIValidator } from "../../../../support/utils/si-us-ui-validator";
import {
  siToUsConversion,
  usToSiConversion,
  convertWithUnits,
  getUnitInfo,
} from "../../../../support/utils/si-us-converter";

/**
 * Example tests demonstrating SI to US conversion with the actual conversion function
 */
test.describe.skip("SI to US Conversion Examples", () => {
  /**
   * Example 1: Direct conversion using the siToUsConversion function
   * This is the most basic usage - pass tag and value, get converted result
   */
  test("Example 1: Direct SI to US Conversion", async () => {
    // Air Flow: 3500 m³/h → CFM
    const airFlowCfm = siToUsConversion("airFlow", 3500);
    console.log(`Air Flow: 3500 m³/h = ${airFlowCfm} CFM`);
    expect(airFlowCfm).toBe("2060");

    // Temperature: 23.89°C → °F
    const tempF = siToUsConversion("returnAirTemp", 23.89);
    console.log(`Temperature: 23.89°C = ${tempF}°F`);
    expect(tempF).toBe("75");

    // Cooling Capacity: 19.646 kW → MBH
    const capacityMbh = siToUsConversion("capacity", 19.646);
    console.log(`Capacity: 19.646 kW = ${capacityMbh} MBH`);
    expect(capacityMbh).toBe("67");

    // Altitude: 1000 m → ft
    const altitudeFt = siToUsConversion("altitude", 1000);
    console.log(`Altitude: 1000 m = ${altitudeFt} ft`);
    expect(altitudeFt).toBe("3280");

    // Pressure: 49.768 Pa → in.wg
    const pressureInWg = siToUsConversion("extStaticPressure", 49.768);
    console.log(`Pressure: 49.768 Pa = ${pressureInWg} in.wg`);
    expect(pressureInWg).toBe("0.20");
  });

  /**
   * Example 2: Reverse conversion using usToSiConversion
   * Convert from US back to SI format
   */
  test("Example 2: US to SI Reverse Conversion", async () => {
    // CFM → m³/h
    const airFlowM3h = usToSiConversion("airFlow", 2060);
    console.log(`Air Flow: 2060 CFM = ${airFlowM3h} m³/h`);
    expect(parseFloat(airFlowM3h)).toBeCloseTo(3500, -2);

    // °F → °C
    const tempC = usToSiConversion("returnAirTemp", 75);
    console.log(`Temperature: 75°F = ${tempC}°C`);
    expect(parseFloat(tempC)).toBeCloseTo(23.89, 0);
  });

  /**
   * Example 3: Using convertWithUnits for value + unit
   * Returns both converted value and the appropriate unit
   */
  test("Example 3: Conversion with Units Information", async () => {
    const airFlowResult = convertWithUnits("airFlow", 3500, "siToUs");
    console.log(
      `Air Flow: ${airFlowResult.value} ${airFlowResult.unit}`,
    );
    expect(airFlowResult.value).toBe("2060");
    expect(airFlowResult.unit).toBe("CFM");

    const tempResult = convertWithUnits("supplyAirTemp", 14.4, "siToUs");
    console.log(
      `Supply Air Temp: ${tempResult.value} ${tempResult.unit}`,
    );
    expect(tempResult.value).toBe("58");
    expect(tempResult.unit).toBe("°F");
  });

  /**
   * Example 4: Get unit information without conversion
   * Useful for display purposes
   */
  test("Example 4: Get Unit Information", async () => {
    const airFlowUnits = getUnitInfo("airFlow");
    console.log(`Air Flow Units: SI=${airFlowUnits.si}, US=${airFlowUnits.us}`);
    expect(airFlowUnits.si).toBe("m³/h");
    expect(airFlowUnits.us).toBe("CFM");

    const tempUnits = getUnitInfo("condensingTemp");
    console.log(`Temp Units: SI=${tempUnits.si}, US=${tempUnits.us}`);
    expect(tempUnits.si).toBe("°C");
    expect(tempUnits.us).toBe("°F");
  });

  /**
   * Example 5: All supported conversion tags
   * Quick reference for all available conversions
   */
  test("Example 5: Test All Conversion Tags", async () => {
    const conversions = [
      { tag: "airFlow" as const, siValue: 3500, expectedUs: "2060" },
      { tag: "totalPressureDrop" as const, siValue: 250, expectedUs: "1.00" },
      {
        tag: "extStaticPressure" as const,
        siValue: 49.768,
        expectedUs: "0.20",
      },
      { tag: "returnAirTemp" as const, siValue: 23.89, expectedUs: "75" },
      { tag: "supplyAirTemp" as const, siValue: 14.4, expectedUs: "58" },
      { tag: "condensingTemp" as const, siValue: 44.4, expectedUs: "112" },
      { tag: "ambientTemp" as const, siValue: 32, expectedUs: "90" },
      { tag: "altitude" as const, siValue: 1000, expectedUs: "3280" },
      { tag: "volumeFlow" as const, siValue: 100, expectedUs: "43.94" },
      { tag: "capacity" as const, siValue: 19.646, expectedUs: "67" },
      { tag: "wetBulbTemperature" as const, siValue: 18, expectedUs: "64" },
    ];

    console.log("\n=== All Conversion Tags Reference ===\n");
    for (const conversion of conversions) {
      const result = siToUsConversion(conversion.tag, conversion.siValue);
      const units = getUnitInfo(conversion.tag);
      console.log(
        `${conversion.tag.padEnd(25)} | ${conversion.siValue.toString().padEnd(10)} ${units.si.padEnd(8)} = ${result.padEnd(8)} ${units.us}`,
      );
    }
  });
});

/**
 * Test suite demonstrating UI validation with locators
 * These tests show how to validate conversions in your UI
 */
test.describe.skip("UI Validation Examples with Locators", () => {
  /**
   * Example: Extract value from locator and convert
   * This demonstrates the validator class usage
   */
  test("Extract and Convert from Locator Text", async ({ page }) => {
    // Create mock HTML with SI value
    await page.setContent(`
      <div class="parameter">
        <label>Air Flow (m³/h):</label>
        <span class="si-value">3500</span>
        <span class="us-value">2060</span>
      </div>
    `);

    // Extract SI value from locator and convert to US
    const siLocator = page.locator(".si-value");
    const usConverted = await SiUsUIValidator.extractAndConvertToUs(
      "airFlow",
      siLocator,
    );

    console.log(`Extracted SI value and converted to US: ${usConverted} CFM`);
    expect(usConverted).toBe("2060");
  });

  /**
   * Example: Validate SI value converts correctly to displayed US value
   */
  test("Validate SI to US Conversion Match", async ({ page }) => {
    // Create mock HTML
    await page.setContent(`
      <div class="results-table">
        <div class="row">
          <span class="parameter-name">Cooling Capacity</span>
          <span class="si-value">19.646</span>
          <span class="unit-si">kW</span>
          <span class="us-value">67</span>
          <span class="unit-us">MBH</span>
        </div>
      </div>
    `);

    // Validate that SI converts to displayed US
    const siLocator = page.locator(".si-value");
    const usDisplayLocator = page.locator(".us-value");

    await SiUsUIValidator.validateSiToUsConversion(
      "capacity",
      siLocator,
      usDisplayLocator,
      1, // 1% tolerance
    );

    console.log("✓ Conversion validation passed");
  });

  /**
   * Example: Validate SI value converts to expected US value
   * Useful when you only have the SI locator and expected US value
   */
  test("Validate SI Converts to Expected US Value", async ({ page }) => {
    // Create mock HTML
    await page.setContent(`
      <div>
        <span class="temperature">23.89</span>
      </div>
    `);

    // Extract SI from locator and verify it converts to expected US value
    const tempLocator = page.locator(".temperature");

    await SiUsUIValidator.validateSiValueConvertsToExpectedUs(
      "returnAirTemp",
      tempLocator,
      75, // Expected US value (°F)
      1,
    );

    console.log("✓ SI value correctly converts to expected US value");
  });

  /**
   * Example: Format conversion result with unit for display
   */
  test("Format Conversion Result for Display", async () => {
    const formatted1 = SiUsUIValidator.formatWithUnit("airFlow", 3500, "siToUs");
    console.log(`Formatted: ${formatted1}`);
    expect(formatted1).toBe("2060 CFM");

    const formatted2 = SiUsUIValidator.formatWithUnit("returnAirTemp", 23.89, "siToUs");
    console.log(`Formatted: ${formatted2}`);
    expect(formatted2).toBe("75 °F");

    const formatted3 = SiUsUIValidator.formatWithUnit("capacity", 19.646, "siToUs");
    console.log(`Formatted: ${formatted3}`);
    expect(formatted3).toBe("67 MBH");
  });

  /**
   * Example: Batch validation of multiple parameters
   */
  test("Batch Validate Multiple Parameters", async ({ page }) => {
    await page.setContent(`
      <div class="results">
        <div class="param">
          <label>Air Flow</label>
          <span class="si">3500</span>
          <span class="us">2060</span>
        </div>
        <div class="param">
          <label>Supply Air Temp</label>
          <span class="si">14.4</span>
          <span class="us">58</span>
        </div>
        <div class="param">
          <label>Cooling Capacity</label>
          <span class="si">19.646</span>
          <span class="us">67</span>
        </div>
      </div>
    `);

    const validations = [
      {
        tag: "airFlow" as const,
        siLocator: page.locator('.param:has-text("Air Flow") .si'),
        usLocator: page.locator('.param:has-text("Air Flow") .us'),
      },
      {
        tag: "supplyAirTemp" as const,
        siLocator: page.locator('.param:has-text("Supply Air Temp") .si'),
        usLocator: page.locator(
          '.param:has-text("Supply Air Temp") .us',
        ),
      },
      {
        tag: "capacity" as const,
        siLocator: page.locator('.param:has-text("Cooling Capacity") .si'),
        usLocator: page.locator('.param:has-text("Cooling Capacity") .us'),
      },
    ];

    console.log("\n=== Batch Parameter Validation ===\n");
    for (const validation of validations) {
      await SiUsUIValidator.validateSiToUsConversion(
        validation.tag,
        validation.siLocator,
        validation.usLocator,
        1,
      );
    }

    console.log("\n✓ All parameters validated successfully");
  });
});

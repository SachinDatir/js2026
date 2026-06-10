/**
 * Unit Conversion Utility for SI (Metric) ↔ US (Imperial) Format
 * Useful for HVAC/Cooling system parameter validation
 */

export interface ConversionResult {
  original: number;
  converted: number;
  fromUnit: string;
  toUnit: string;
}

// ============= TEMPERATURE CONVERSIONS =============

/**
 * Convert Celsius to Fahrenheit
 * Formula: (°C × 9/5) + 32
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * Formula: (°F - 32) × 5/9
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

// ============= AIR FLOW CONVERSIONS =============

/**
 * Convert Cubic Meters per Hour (m³/h) to CFM (cubic feet per minute)
 * 1 m³/h = 0.588578 CFM
 */
export function m3hToCfm(m3h: number): number {
  return m3h * 0.588578;
}

/**
 * Convert CFM to Cubic Meters per Hour (m³/h)
 * 1 CFM = 1.69901 m³/h
 */
export function cfmToM3h(cfm: number): number {
  return cfm * 1.69901;
}

/**
 * Convert Cubic Meters per Second (m³/s) to CFM
 * 1 m³/s = 2118.88 CFM
 */
export function m3sToCfm(m3s: number): number {
  return m3s * 2118.88;
}

/**
 * Convert CFM to Cubic Meters per Second (m³/s)
 * 1 CFM = 0.000471947 m³/s
 */
export function cfmToM3s(cfm: number): number {
  return cfm * 0.000471947;
}

// ============= PRESSURE CONVERSIONS =============

/**
 * Convert Pascals (Pa) to Inches of Water (in.wg)
 * 1 Pa = 0.00401865 in.wg
 */
export function pascalsToInWg(pascals: number): number {
  return pascals * 0.00401865;
}

/**
 * Convert Inches of Water (in.wg) to Pascals (Pa)
 * 1 in.wg = 248.84 Pa
 */
export function inWgToPascals(inWg: number): number {
  return inWg * 248.84;
}

/**
 * Convert Pascals (Pa) to PSI
 * 1 Pa = 0.000145038 PSI
 */
export function pascalsToPsi(pascals: number): number {
  return pascals * 0.000145038;
}

/**
 * Convert PSI to Pascals (Pa)
 * 1 PSI = 6894.76 Pa
 */
export function psiToPascals(psi: number): number {
  return psi * 6894.76;
}

/**
 * Convert Bar to PSI
 * 1 Bar = 14.5038 PSI
 */
export function barToPsi(bar: number): number {
  return bar * 14.5038;
}

/**
 * Convert PSI to Bar
 * 1 PSI = 0.0689476 Bar
 */
export function psiToBar(psi: number): number {
  return psi * 0.0689476;
}

// ============= COOLING CAPACITY CONVERSIONS =============

/**
 * Convert Kilowatts (kW) to MBH (1000 BTU/hour)
 * 1 kW = 3.41214 MBH
 */
export function kwToMbh(kw: number): number {
  return kw * 3.41214;
}

/**
 * Convert MBH to Kilowatts (kW)
 * 1 MBH = 0.293071 kW
 */
export function mbhToKw(mbh: number): number {
  return mbh * 0.293071;
}

/**
 * Convert Kilowatts (kW) to BTU/hour
 * 1 kW = 3412.14 BTU/h
 */
export function kwToBtuh(kw: number): number {
  return kw * 3412.14;
}

/**
 * Convert BTU/hour to Kilowatts (kW)
 * 1 BTU/h = 0.000293071 kW
 */
export function btuhToKw(btuh: number): number {
  return btuh * 0.000293071;
}

// ============= ENERGY EFFICIENCY CONVERSIONS =============

/**
 * Convert EER (Energy Efficiency Ratio - BTU/h per Watt) to COP (Coefficient of Performance)
 * COP = EER / 3.412
 */
export function eerToCop(eer: number): number {
  return eer / 3.412;
}

/**
 * Convert COP to EER
 * EER = COP × 3.412
 */
export function copToEer(cop: number): number {
  return cop * 3.412;
}

// ============= WEIGHT/MASS CONVERSIONS =============

/**
 * Convert Kilograms (kg) to Pounds (lb)
 * 1 kg = 2.20462 lb
 */
export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert Pounds (lb) to Kilograms (kg)
 * 1 lb = 0.453592 kg
 */
export function lbToKg(lb: number): number {
  return lb * 0.453592;
}

// ============= LENGTH/HEIGHT CONVERSIONS =============

/**
 * Convert Meters (m) to Inches (in)
 * 1 m = 39.3701 in
 */
export function metersToInches(meters: number): number {
  return meters * 39.3701;
}

/**
 * Convert Inches (in) to Meters (m)
 * 1 in = 0.0254 m
 */
export function inchesToMeters(inches: number): number {
  return inches * 0.0254;
}

/**
 * Convert Meters (m) to Feet (ft)
 * 1 m = 3.28084 ft
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Convert Feet (ft) to Meters (m)
 * 1 ft = 0.3048 m
 */
export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

// ============= VALIDATION HELPERS =============

/**
 * Validate if two values are approximately equal within tolerance
 * Useful for comparing converted values
 */
export function areValuesEqual(
  value1: number,
  value2: number,
  tolerance: number = 0.01,
): boolean {
  return Math.abs(value1 - value2) <= tolerance;
}

/**
 * Validate if two values are approximately equal within percentage tolerance
 * Useful for comparing values with percentage-based tolerance
 */
export function areValuesEqualWithinPercent(
  value1: number,
  value2: number,
  percentageTolerance: number = 1,
): boolean {
  const maxDifference = (value1 * percentageTolerance) / 100;
  return Math.abs(value1 - value2) <= maxDifference;
}

/**
 * Round a number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generic conversion function with unit mapping
 */
export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
): ConversionResult {
  const conversionMap: { [key: string]: { [key: string]: (val: number) => number } } = {
    celsius: { fahrenheit: celsiusToFahrenheit },
    fahrenheit: { celsius: fahrenheitToCelsius },
    m3h: { cfm: m3hToCfm },
    cfm: { m3h: cfmToM3h },
    m3s: { cfm: m3sToCfm },
    pascals: { "in.wg": pascalsToInWg, psi: pascalsToPsi },
    "in.wg": { pascals: inWgToPascals },
    psi: { pascals: psiToPascals, bar: psiToBar },
    bar: { psi: barToPsi },
    kw: { mbh: kwToMbh, btuh: kwToBtuh },
    mbh: { kw: mbhToKw },
    btuh: { kw: btuhToKw },
    kg: { lb: kgToLb },
    lb: { kg: lbToKg },
    m: { in: metersToInches, ft: metersToFeet },
    in: { m: inchesToMeters },
    ft: { m: feetToMeters },
  };

  const converter = conversionMap[fromUnit.toLowerCase()]?.[toUnit.toLowerCase()];
  if (!converter) {
    throw new Error(
      `Conversion from ${fromUnit} to ${toUnit} is not supported`,
    );
  }

  return {
    original: value,
    converted: roundTo(converter(value)),
    fromUnit,
    toUnit,
  };
}

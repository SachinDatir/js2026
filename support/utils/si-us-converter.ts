/**
 * SI to US Unit Conversion Function
 * Converts metric (SI) values to US imperial units based on parameter tag
 */

export type ConversionTag =
  | 'airFlow'
  | 'totalPressureDrop'
  | 'extStaticPressure'
  | 'medInTempDegC'
  | 'medOutTempDegC'
  | 'glycolPercentage'
  | 'returnAirTemp'
  | 'supplyAirTemp'
  | 'condensingTemp'
  | 'adiabaticTemp'
  | 'ambientTemp'
  | 'altitude'
  | 'volumeFlow'
  | 'casing'
  | 'pump'
  | 'number'
  | 'airInletFreeCooling'
  | 'distanceFreeField'
  | 'capacity'
  | 'wetBulbTemperature'
  | 'fluidPressureDrop';

/**
 * Convert SI (Metric) value to US (Imperial) unit based on parameter tag
 * @param tag - Parameter identifier/tag name
 * @param value - SI format value to convert
 * @returns Converted US format value as string
 */
export const siToUsConversion = (tag: ConversionTag, value: number): string => {
  let result: string | number = value;

  switch (tag) {
    // Air Flow: m³/h to CFM
    // 1 m³/h = 0.58858 CFM
    case 'airFlow':
      result = (Math.round((value * 0.58858) / 100) * 100).toFixed(0);
      return result;

    // Total Pressure Drop: Pa to in.wg
    // 1 Pa = 0.004 in.wg (approximately 1/250)
    case 'totalPressureDrop':
      result = Number(value / 250).toFixed(2);
      return result;

    // External Static Pressure: Pa to in.wg
    // 1 Pa = 0.004018 in.wg (approximately 1/249.0889)
    case 'extStaticPressure':
      result = Number((value / 249.0889).toFixed(2));
      return result;

    // Medium In Temperature: °C to °F
    // °F = (°C × 9/5) + 32
    case 'medInTempDegC':
      result = Number((value * (9 / 5)) + 32).toFixed(1);
      return result;

    // Medium Out Temperature: °C to °F
    case 'medOutTempDegC':
      result = Number((value * (9 / 5)) + 32).toFixed(1);
      return result;

    // Glycol Percentage: °C to °F (for glycol freeze point)
    case 'glycolPercentage':
      result = Number((value * (9 / 5)) + 32).toFixed(1);
      return result;

    // Return Air Temperature: °C to °F
    case 'returnAirTemp':
      result = Number(Math.round((value * (9 / 5)) + 32));
      return result.toString();

    // Supply Air Temperature: °C to °F
    case 'supplyAirTemp':
      result = Number(Math.round((value * (9 / 5)) + 32));
      return result.toString();

    // Condensing Temperature: °C to °F
    case 'condensingTemp':
      result = Number(Math.round((value * (9 / 5)) + 32));
      return result.toString();

    // Adiabatic Temperature: °C to °F
    case 'adiabaticTemp':
      result = Number((value * (9 / 5)) + 32).toFixed(0);
      return result;

    // Ambient Temperature: °C to °F
    case 'ambientTemp':
      result = Number((value * (9 / 5)) + 32).toFixed(0);
      return result;

    // Altitude: m to ft
    // 1 m = 3.280 ft
    case 'altitude':
      result = Number(Math.round((value * 3.280) / 100) * 100).toFixed(0);
      return result;

    // Volume Flow: l/min to GPM
    // 1 l/min = 0.2642 GPM (approximately 1/0.2274)
    case 'volumeFlow':
      result = (value / 0.2274).toFixed(2);
      return result;

    // Casing: mm to inches
    // 1 mm = 0.03937 inches (approximately 1/25.4)
    case 'casing':
      result = (value / 25.4).toFixed(2);
      return result;

    // Pump: No conversion needed
    case 'pump':
      return value.toString();

    // Number: No conversion needed
    case 'number':
      return value.toString();

    // Air Inlet Free Cooling: °C to °F
    case 'airInletFreeCooling':
      result = Number((value * (9 / 5)) + 32).toFixed(1);
      return result;

    // Distance Free Field: m to ft
    // 1 m = 3.280 ft
    case 'distanceFreeField':
      result = Number(Math.round((value * 3.280) / 100) * 100).toFixed(0);
      return result;

    // Capacity: kW to MBH (1000 BTU/hour)
    // 1 kW = 3.4121 MBH
    case 'capacity':
      result = Number((value * 3.4121).toFixed(0));
      return result.toString();

    // Wet Bulb Temperature: °C to °F
    case 'wetBulbTemperature':
      result = Number(Math.round((value * (9 / 5)) + 32));
      return result.toString();

    // Fluid Pressure Drop: Pa to PSI
    // 1 Pa = 0.0001450377 PSI
    case 'fluidPressureDrop':
      result = Number((value * 0.1450377).toFixed(2));
      return result;

    default:
      return value.toString();
  }
};

/**
 * Convert US (Imperial) value back to SI (Metric) format
 * Inverse conversion for bidirectional support
 */
export const usToSiConversion = (tag: ConversionTag, value: number): string => {
  let result: string | number = value;

  switch (tag) {
    case 'airFlow':
      result = (value / 0.58858).toFixed(2);
      return result;

    case 'totalPressureDrop':
      result = (value * 250).toFixed(2);
      return result;

    case 'extStaticPressure':
      result = (value * 249.0889).toFixed(2);
      return result;

    case 'medInTempDegC':
    case 'medOutTempDegC':
    case 'glycolPercentage':
    case 'airInletFreeCooling':
      result = ((value - 32) * (5 / 9)).toFixed(1);
      return result;

    case 'returnAirTemp':
    case 'supplyAirTemp':
    case 'condensingTemp':
    case 'wetBulbTemperature':
      result = Math.round((value - 32) * (5 / 9));
      return result.toString();

    case 'adiabaticTemp':
    case 'ambientTemp':
      result = ((value - 32) * (5 / 9)).toFixed(0);
      return result;

    case 'altitude':
    case 'distanceFreeField':
      result = (value / 3.280).toFixed(2);
      return result;

    case 'volumeFlow':
      result = (value * 0.2274).toFixed(2);
      return result;

    case 'casing':
      result = (value * 25.4).toFixed(2);
      return result;

    case 'capacity':
      result = (value / 3.4121).toFixed(2);
      return result;

    case 'fluidPressureDrop':
      result = (value / 0.1450377).toFixed(2);
      return result;

    case 'pump':
    case 'number':
      return value.toString();

    default:
      return value.toString();
  }
};

/**
 * Get the unit description for a tag in both SI and US formats
 */
export const getUnitInfo = (tag: ConversionTag): { si: string; us: string } => {
  const unitMap: Record<ConversionTag, { si: string; us: string }> = {
    airFlow: { si: 'm³/h', us: 'CFM' },
    totalPressureDrop: { si: 'Pa', us: 'in.wg' },
    extStaticPressure: { si: 'Pa', us: 'in.wg' },
    medInTempDegC: { si: '°C', us: '°F' },
    medOutTempDegC: { si: '°C', us: '°F' },
    glycolPercentage: { si: '°C', us: '°F' },
    returnAirTemp: { si: '°C', us: '°F' },
    supplyAirTemp: { si: '°C', us: '°F' },
    condensingTemp: { si: '°C', us: '°F' },
    adiabaticTemp: { si: '°C', us: '°F' },
    ambientTemp: { si: '°C', us: '°F' },
    altitude: { si: 'm', us: 'ft' },
    volumeFlow: { si: 'l/min', us: 'GPM' },
    casing: { si: 'mm', us: 'in' },
    pump: { si: '-', us: '-' },
    number: { si: '-', us: '-' },
    airInletFreeCooling: { si: '°C', us: '°F' },
    distanceFreeField: { si: 'm', us: 'ft' },
    capacity: { si: 'kW', us: 'MBH' },
    wetBulbTemperature: { si: '°C', us: '°F' },
    fluidPressureDrop: { si: 'Pa', us: 'PSI' },
  };

  return unitMap[tag] || { si: '', us: '' };
};

/**
 * Convenience function for converting with unit info
 */
export const convertWithUnits = (
  tag: ConversionTag,
  value: number,
  direction: 'siToUs' | 'usToSi' = 'siToUs',
): { value: string; unit: string } => {
  const units = getUnitInfo(tag);
  const converted =
    direction === 'siToUs'
      ? siToUsConversion(tag, value)
      : usToSiConversion(tag, value);

  return {
    value: converted,
    unit: direction === 'siToUs' ? units.us : units.si,
  };
};

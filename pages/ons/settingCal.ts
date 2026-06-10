import { type Locator, type Page } from "@playwright/test";

export class SettingPage {
  private readonly page: Page;
  readonly settingTab: Locator;
  readonly setting_Compressor_field: Locator;
  readonly input_Air_Flow_Min: Locator;
  readonly input_Air_Flow_Max: Locator;
  readonly input_returnAirTemp_Min: Locator;
  readonly input_returnAirTemp_Max: Locator;
  readonly input_Pressure_Drop_offSet: Locator;
  constructor(page: Page) {
    this.page = page;
    this.settingTab = page.locator("a[title=Settings]");
    this.setting_Compressor_field = page.locator("#inputKompressor1");
    this.input_Air_Flow_Min = page.locator(
      "si-us-formatter#inputVolumenstromMin input",
    );
    this.input_Air_Flow_Max = page.locator(
      "si-us-formatter#inputVolumenstromMax input",
    );
    this.input_returnAirTemp_Min = page.locator(
      "si-us-formatter#inputMinRueckluftTemp input",
    );
    this.input_returnAirTemp_Max = page.locator(
      "si-us-formatter#inputMaxRueckluftTemp input",
    );
    this.input_Pressure_Drop_offSet = page.locator(
      "si-us-formatter#inputLuftdruckOffset input",
    );
  }
}

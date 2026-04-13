import { expect, type Locator, type Page } from "@playwright/test";
export class InputPage {
  readonly page: Page;
  readonly inputAirFlow: Locator;
  readonly externalStaticPressure: Locator;
  readonly inputProductLine: Locator;
  readonly ERDbutton :Locator

  constructor(page: Page) {
    this.page = page;
    this.inputAirFlow = page.locator("input#inputAirFlow");
    this.externalStaticPressure = page.locator("input#inputExt");
    this.inputProductLine = page.locator("#inputProductLine");
    this.ERDbutton = page.locator('a[title="Electrical Data Sheet"]')

  }

  async enterAirFlow(airFlowValue: string) {
    await this.inputAirFlow.first().click();
    await this.inputAirFlow.first().fill(airFlowValue);
    await this.inputAirFlow.first().press("Enter");
  }

  async InputParameter(locator: Locator, value: string) {
    await locator.first().click();
    await locator.first().fill(value);
    await locator.first().press("Enter");
  }
  async expectParameterValue(locator: Locator, value: string) {
    await expect(locator.last()).toHaveValue(value);
    console.log(`Verified that the parameter value is ${value}`);

  }
}

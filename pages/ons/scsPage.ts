import { type Page, type Locator } from "@playwright/test";
export class ScsPage {
  private page: Page;
  readonly scsTab: Locator;
  readonly system1AmbientTempInput: Locator;
  readonly numOfModels : Locator;
  readonly componentPage: Locator;
  readonly altitudeInput: Locator
  constructor(page: Page) {
    this.page = page;
    this.scsTab = page.locator("#toolsTabBtn");
    this.system1AmbientTempInput = page.locator("input#system1-ambient-temp");
    this.numOfModels = page.locator("input#system1-input-number-models")
    this.componentPage = page.locator("#page2-tab")
    this.altitudeInput = page.locator("input#system1-altitude")
  }
}

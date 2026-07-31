import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { ProductConfigurationPage } from "../../../../pages/ons/ProductConfigurationPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { InputPage } from "../../../../pages/ons/InputPage";
import { cyberAirDxModels } from "../../../../test-data/ons-models";
test.describe("Validate the tables in playwright", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let configPage: ProductConfigurationPage;
  let productLine: ProductLinePage;
  let inputPage: InputPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    configPage = new ProductConfigurationPage(page);
    productLine = new ProductLinePage(page);
    inputPage = new InputPage(page);

    await page.goto("/app/module-selector/filter-section");
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await dashboardPage.openRoomCooling();
    await dashboardPage.roomCoolingDeuProductLine.isVisible();
  });

  test("Open the ocs page and validate the table", async ({ page }) => {
    let evaporatorExpertResponsePromise;
    let compressorExpertResponsePromise;
    const condenserListResponsePromise = waitForApi(page, "condenserList");
    const condenserFormattedResponsePromise = waitForApi(
      page,
      "condenserFormatted",
    );
    evaporatorExpertResponsePromise = waitForApi(
      page,
      "thestEvaporatorExpertCalculation",
    );
    compressorExpertResponsePromise = waitForApi(
      page,
      "compressorExpertCalculation",
    );
    const deuProductLine = dashboardPage.deuProductLine;
    const cyberAirCard = dashboardPage.CyberAirCard;

    await dashboardPage.selectProductLine(deuProductLine, cyberAirCard);
    await dashboardPage.selectDischargeType(" Downflow ");
    await dashboardPage.selectCoolingSystem("A");
    // await dashboardPage.selectCompressorType(" On/Off ");

    await dashboardPage.selectModel(cyberAirDxModels.asd211A);

    // await submitAndWaitForResponse(=> dashboardPage.proceed() , page, "performAllCalculations");
    const checkCalResponse = await submitAndWaitForResponse(
      () => dashboardPage.proceed(),
      page,
      "performAllCalculations",
    );

    await checkCalResponse.json().then((res) => {
      expect(res).toHaveProperty("data");
      expect(res.data.outputData).toBeDefined();
      expect(res.data.outputData.unitOutput.unitType).toBe(
        cyberAirDxModels.asd211A,
      );
    });
    await Promise.all([
      condenserListResponsePromise,
      condenserFormattedResponsePromise,
      evaporatorExpertResponsePromise,
      compressorExpertResponsePromise,
    ]);
    await expect(page.locator("div > .swal2-popup")).toBeHidden();
    await expect(inputPage.ocsButton).toBeVisible();

    const checkCalResOcs = await submitAndWaitForResponse(
      () => inputPage.ocsButton.click({ force: true }),
      page,
      "Hamburg",
    );
    await checkCalResOcs;

    const rows = page.locator(".tableOcs>thead>tr");
    const actualData = [];
    for (let i = 0; i < (await rows.count()); i++) {
      const cells = rows.nth(i).locator("td");
      actualData.push({
        parameter: await cells.nth(0).textContent(),
        value: await cells.nth(1).textContent(),
      });
    }

    expect(actualData).toEqual([
      { parameter: "Model:", value: "ASD 211 A / KSV038A21p " },
      { parameter: "Cooling capacity (total): ", value: "23.5 kW" },
      { parameter: "Return air temperature:", value: "33 °C" },
      { parameter: "Relative humidity:", value: "30 %" },
      { parameter: "Air flow:", value: "4,800 m³/h" },
      { parameter: "External static pressure:", value: "20 Pa " },
      { parameter: "Altitude above sea level:", value: "0 m" },
      { parameter: "Power supply:", value: "400V/50Hz/3Ph/N/PE " },
      { parameter: "Condensing temperature:", value: "45  °C" },
      { parameter: "Ambient temperature:", value: "35  °C" },
      { parameter: "Annual Energy Consumption:", value: "44,127 kWh/a" },
      { parameter: "Annual Energy Cost:", value: " 8,384 EUR" },
      { parameter: "pPUE:", value: "1.22 " },
    ]);

    // const ocsRows = page.locator("#OCSTableId >tbody>#ocsTableRows")

    // const ocsTable = []
    // for(let i =0;i< await ocsRows.count();i++){
    //     const cells =  ocsRows.nth(i).locator('td')

    //     ocsTable.push({
    //         index : i,
    //         value : await cells.textContent()
    //     })

    // }
   const row1 =  ["32",	"4",	"DX",	"100",	"23",	"4.2",	"17",	"0.5",	"2",	"1.1",	"4",	"23"]
    const table = await page
      .locator("#OCSTableId tbody tr")
      .evaluateAll((rows) =>
        rows.map((row) =>
          [...row.querySelectorAll("td")].map((td) => td.textContent?.trim()),
        ),
      );

    console.log(table);
    expect(table[0]).toEqual(row1)
    // console.log(ocsTable,">>>>>")
    await page.pause();
  });
});

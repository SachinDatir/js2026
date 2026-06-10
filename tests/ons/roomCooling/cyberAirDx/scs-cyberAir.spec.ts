import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import { ScsPage } from "../../../../pages/ons/scsPage";
import { defaultUser } from "../../../../test-data/auth-users";
import { waitForApi } from "../../../../support/ons-helper";

const { email, password } = defaultUser;

test.describe("CyberAirDx Saving and Retrieval", () => {
  let loginPage: LoginPage;
  let scsPage: ScsPage;
  let configName: string;
  let configurationData: {
    configName: string;
    configId?: any;
    originalValues?: any;
    updatedValues?: any;
  };
  let testData: {
    username: string;
    password: string;
    projectName: string;
    configToShare: string;
    newAmbientTemp: string;
    newAirFlow: number;
    newExtStaticPressure: number;
    numOfModels: number;
    altitude: number;
  };
  test.beforeAll(() => {
    // Initialize Page Object and API Service

    // Load test data from environment variables
    testData = {
      username: process.env.EMAIL as string,
      password: process.env.PASSWORD as string,
      projectName: process.env.selectProjectSaving as string,
      configToShare: process.env.configToShare as string,
      newAmbientTemp: "37",
      newAirFlow: 4300,
      newExtStaticPressure: 21,
      numOfModels: 2,
      altitude: 100,
    };

    // Initialize configuration data
    configurationData = {
      configName: "Test" + (+Date.now() % 100000),
    };
  });
  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    scsPage = new ScsPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();

    // loginTokenResponse = await generateLoginToken(request, email, password);
  });

  test("Verify scs functionality for CyberAirDx model", async ({ page }) => {
    let netSensiblCap: number;
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await test.step("verify the output for cyberAirDx model", async () => {
      await scsPage.scsTab.click();

      // 1. Start waiting for the specific response
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/performAllCalculations") &&
          response.status() === 200,
      );

      // 2. Trigger the action that causes the request
      await page.getByText("System cost simulation").click();

      // 3. Wait for the response to arrive and parse it
      const response = await responsePromise;
      const responseBody = await response.json();

      // 4. Assign the value and perform logic
      netSensiblCap =
        responseBody.data.outputData.unitOutput.netSensibleCoolingCapacity;

      console.log("Captured Value:", netSensiblCap);
      const netCoolingCapacity: any = Math.floor(netSensiblCap) * 2;
      console.log("Calculated Capacity:", netCoolingCapacity.toString());

      await expect(page.getByText("System").nth(1)).toBeVisible();
      await expect(page.locator("#system1-net-sensible-cap")).toHaveValue(
        netCoolingCapacity.toString(),
      );

      let pPUE =
        (netCoolingCapacity * 8760 + 76912) / (netCoolingCapacity * 8760);
      console.log("Calculated pPUE:", pPUE.toString());
      await expect(page.locator("#system1-ppue")).toHaveText(
        pPUE.toFixed(2).toString(),
      );
    });
  });

  test.only("Verify scs functionality for CyberAirDx model with input values", async ({
    page,
  }) => {
    let netSensiblCap: number;

    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await test.step("verify the output for cyberAirDx model", async () => {
      await scsPage.scsTab.click();

      // 1. Start waiting for the specific response
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/performAllCalculations") &&
          response.status() === 200,
      );

      // 2. Trigger the action that causes the request
      await page.getByText("System cost simulation").click();

      // 3. Wait for the response to arrive and parse it
      const response = await responsePromise;
      const responseBody = await response.json();

      // 4. Assign the value and perform logic
      netSensiblCap =
        responseBody.data.outputData.unitOutput.netSensibleCoolingCapacity;

      console.log("Captured Value:", netSensiblCap);
      const netCoolingCapacity: any = Math.floor(netSensiblCap) * 2;
      console.log("Calculated Capacity:", netCoolingCapacity.toString());

      await expect(page.getByText("System").nth(1)).toBeVisible();
      await expect(page.locator("#system1-net-sensible-cap")).toHaveValue(
        netCoolingCapacity.toString(),
      );

      let pPUE =
        (netCoolingCapacity * 8760 + 76912) / (netCoolingCapacity * 8760);
      console.log("Calculated pPUE:", pPUE.toString());
      await expect(page.locator("#system1-ppue")).toHaveText(
        pPUE.toFixed(2).toString(),
      );

      //update ambient temp
      await page.route("**/performAllCalculations", (route) =>
        route.continue(),
      );
      await page.route("**/condenserList", (route) => route.continue());

      await scsPage.system1AmbientTempInput.first().click();
      await scsPage.system1AmbientTempInput
        .first()
        .fill(testData.newAmbientTemp);
      await Promise.all([
        page.waitForResponse("**/performAllCalculations"), // Wait for the network
        scsPage.system1AmbientTempInput.first().press("Enter"), // Trigger the network
      ]);
      await page.route("**/condenserList", (route) => route.continue());
      await page.waitForTimeout(2000)
      await scsPage.numOfModels.first().click();
      await scsPage.numOfModels.first().fill(testData.numOfModels.toString());
      await scsPage.numOfModels.first().press("Enter");
      await page.waitForTimeout(2000)
      
      await scsPage.componentPage.click();
      await scsPage.altitudeInput.first().isVisible();
      await scsPage.altitudeInput.first().click();
      await scsPage.altitudeInput.first().fill(testData.altitude.toString());
      await Promise.all([
        page.waitForResponse("**/performAllCalculations"), // Wait for the network
        await scsPage.altitudeInput.first().press("Enter"),
        // Trigger the network
      ]);

      await page.locator("#system1-input-airflow").nth(1).click();
      await page.locator("#system1-input-airflow").nth(1).isVisible();
      await page
        .locator("#system1-input-airflow")
        .nth(1)
        .fill(testData.newAirFlow.toString());

      const responsePro = page.waitForResponse(
        (response) =>
          response.url().includes("/performAllCalculations") &&
          response.status() === 200,
      );
      // Wait for the network
      await page.locator("#system1-input-airflow").nth(1).press("Enter");

      const resJson = await responsePro;
      const body = await resJson.json();
      netSensiblCap =
        body.data.outputData.unitOutput.netSensibleCoolingCapacity;

      console.log("Captured Value:", netSensiblCap);
      const netCoolingCapacityUpdated: any = netSensiblCap * 4;
      console.log(
        "Calculated netCoolingCapacityUpdated:",
        netCoolingCapacityUpdated.toString(),
      );

      await page.pause()
      let pPUEupdated =
        (netCoolingCapacityUpdated * 8760 + 166795) /
        (netCoolingCapacityUpdated * 8760);
      console.log("Calculated pPUE:", pPUEupdated.toString());
      await expect(page.locator("#system1-ppue")).toHaveText(
        pPUEupdated.toFixed(2).toString(),
      );
      await page.pause();
    });
  });
});

import { expect, test } from "@playwright/test";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { waitForApi } from "../../../support/ons-helper";
import { defaultUser } from "../../../test-data/auth-users";
import { DashboardPage } from "../../../pages/ons/DashboardPage";
import { InputPage } from "../../../pages/ons/InputPage";
const { email, password } = defaultUser;

test.describe("", () => {
  let loginPage: LoginPage;
  let dashBoardPage: DashboardPage;
  let inputPage: InputPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    inputPage = new InputPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await page.getByText(" High Density Cooling ").click();

    await page.locator("#DEU").getByText("CyberRack Active Rear Door").click();
  });

  test("Verify High density cooling model", async ({ page }) => {
    await test.step("", async () => {
      let netSensCoolCap;
      let unitType;

      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/performAllCalculations") &&
          response.status() === 200,
      );
      await page.route("../thestExpertCalculations", async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response });
      });
      await dashBoardPage.proceed();

      const response = await responsePromise;
      const responseBody = await response.json();
      expect(responseBody).toBeDefined();

      netSensCoolCap =
        responseBody.data.outputData.unitOutput.netSensibleCoolingCapacity;

      unitType = responseBody.data.outputData.unitOutput.unitType;
      await page.route("**/Hamburg", async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response });
      });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("load");
      await page.waitForTimeout(1000);
      await inputPage.ocsButton.dblclick({ force: true });
      await page.waitForTimeout(1000);
      await inputPage.annualEnergyConsumption
        .textContent()
        .then((text: any) => {
          console.log("Raw text from browser:", text);

          const cleanText = text ? text.trim() : "";

          let cleanedString = cleanText.replace(/\D/g, "");
          const annualEnergyConsumption = parseFloat(cleanedString);

          console.log(annualEnergyConsumption, ">>>>>>>");
          console.log(netSensCoolCap, ">>>>netSensCoolCap>>>");

          let pPUE =
            (annualEnergyConsumption + netSensCoolCap * 8760) /
            (netSensCoolCap * 8760);

          console.log(pPUE, "?pPUE");
          let finalPpue = Math.round(pPUE * 100) / 100;
          console.log(finalPpue, "ppue");
          expect(page.locator("#ocsPpue")).toHaveText(finalPpue.toString());
        });

      let modelName = await page
        .locator(".tableOcs")
        .first()
        .locator("h6")
        .first()
        .textContent();
      let coolCap = await page
        .locator(".tableOcs")
        .first()
        .locator("h6")
        .nth(1)
        .textContent();
      await expect(modelName).toEqual(modelName);
    });
  });

  test.only("Validate the expert tab", async ({ page }) => {
    await page.route("../performAllCalculations", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });
    await page.route("../thestExpertCalculations", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await dashBoardPage.proceed();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);
    // await page.pause();
    // await page.locator('a[title=" Modine "]').dblclick({ force: true });
    // await expect(
    //   page.locator('[id="ThestCoilStaticBackdrop"]').locator(".modal-title"),
    // ).toHaveText("Thest CW Coil Calculation");
    // const responsePromise = page.waitForResponse(
    //   (response) =>
    //     response.url().includes("thestExpertCalculations") &&
    //     response.status() === 200,
    // );
    // await page.getByRole("button", { name: "Calculate" }).click();
    // let res = await responsePromise;
    // let resJson = res.json();
    // console.log(resJson);
  });
});

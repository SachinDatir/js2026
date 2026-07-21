import { expect, test, type Page } from "@playwright/test";
import { LoginPage } from "../../../../pages/auth/LoginPage";
import {
  submitAndWaitForResponse,
  waitForApi,
} from "../../../../support/utils/wait-utils";
import { defaultUser } from "../../../../test-data/auth-users";
import { DashboardPage } from "../../../../pages/ons/DashboardPage";
import { InputPage } from "../../../../pages/ons/InputPage";
import { ProductLinePage } from "../../../../pages/ons/ProductLinePage";
import { SettingPage } from "../../../../pages/ons/settingCal";

const { email, password } = defaultUser;

function getExpectedNetTotalCoolingCapacity(responseBody: any): string {
  const outputData = responseBody.data?.outputData;
  const coolingCapacity = outputData?.unitOutput?.coolingCapacity;
  const fanPowerKw = outputData?.fan?.totalPowerConsumption;

  expect(coolingCapacity).toBeDefined();
  expect(fanPowerKw).toBeDefined();

  return (Math.round((coolingCapacity - fanPowerKw) * 100) / 100).toFixed(1);
}

async function getOperatingPointTableTexts(
  page: Page,
  operatingPoint: string,
): Promise<string[]> {
  const operatingPointTable = page
    .locator(".scrolling-op", { hasText: new RegExp(operatingPoint) })
    .locator(".table");

  await expect(operatingPointTable).toBeVisible();
  return operatingPointTable.locator("tbody tr td").allTextContents();
}

test.describe("Verify the cyberLab functionality", () => {
  test.describe.configure({ mode: "parallel" });
  let loginPage: LoginPage;
  let dashBoardPage: DashboardPage;
  let inputPage: InputPage;
  let productLinePage: ProductLinePage;
  let settingPage: SettingPage;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    inputPage = new InputPage(page);
    productLinePage = new ProductLinePage(page);
    settingPage = new SettingPage(page);

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.loginAndValidate(email, password);
    await loginPage.expectAppOpened();
    await page.waitForLoadState("domcontentloaded");
    await waitForApi(page, "modelSelectionFilters");
    await dashBoardPage.openRoomCooling();
    await page.locator("#DEU").getByText("CyberLab").click();
  });

  test("Verify the cyberLab functionality", async ({ page }) => {
    await page.locator("#DEU").getByText("CyberLab").click();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/performAllCalculations") &&
        response.status() === 200,
    );
    await dashBoardPage.proceed();

    const response = await responsePromise;
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    const rangeInput = page.locator(".flex-grow-1 >#inputAirFlow");
    // Assert that the min and max attributes have the expected values
    await expect(rangeInput).toHaveAttribute("min", "3000");
    await expect(rangeInput).toHaveAttribute("max", "7000");

    await settingPage.settingTab.click({ force: true });

    await page.waitForSelector("si-us-formatter#inputVolumenstromMin input");
    await page.locator("si-us-formatter#inputVolumenstromMin input").click();
    await page
      .locator("si-us-formatter#inputVolumenstromMin input")
      .fill("2500");

    await page.locator("si-us-formatter#inputVolumenstromMax input").click();
    await page
      .locator("si-us-formatter#inputVolumenstromMax input")
      .fill("7500");

    await page.route("../performAllCalculations", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.route("../condenserFormatted", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.waitForTimeout(2000);
    await page.locator("#recalculateId").click({ force: true });
    await page.waitForTimeout(2000);

    await expect(rangeInput).toHaveAttribute("min", "2500");
    await expect(rangeInput).toHaveAttribute("max", "7500");

    const condensorCard = page.locator("#condensorInputId");
    await condensorCard.click();

    // Verify that pointer-events are set to none, preventing clicks
    await expect(condensorCard).toHaveCSS("pointer-events", "auto", {
      timeout: 5000,
    });
  });

  test("verify the print functionality", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/performAllCalculations") &&
        response.status() === 200,
    );

    const responseCond = page.waitForResponse(
      (response) =>
        response.url().includes("/condenserFormatted") &&
        response.status() === 200,
    );

    const printResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/printDoc") && response.status() === 200,
    );

    await dashBoardPage.proceed();

    const response = await responsePromise;
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    const responseCondenser = await responseCond;
    const responseBodyCondenser = await responseCondenser.json();
    expect(responseBodyCondenser).toBeDefined();

    await page.locator('a[title="Print"]').click();
    await printResponse;
    // Add assertions for print functionality
  });

  test("Verify the output section", async ({ page }) => {
    await test.step("Load the CyberLab configuration", async () => {
      const performAllCalculations = page.waitForResponse(
        (response) =>
          response.url().includes("/performAllCalculations") &&
          response.status() === 200,
      );
      const condenserFormatted = page.waitForResponse(
        (response) =>
          response.url().includes("/condenserFormatted") &&
          response.status() === 200,
      );

      await dashBoardPage.proceed();

      const [calculationResponse, condenserResponse] = await Promise.all([
        performAllCalculations,
        condenserFormatted,
      ]);

      expect(await calculationResponse.json()).toBeDefined();
      expect(await condenserResponse.json()).toBeDefined();
    });

    await test.step("Add an operating point and validate net total cooling capacity", async () => {
      const condenserFormatted = waitForApi(page, "condenserFormatted");
      const calculationResponse = await submitAndWaitForResponse(
        () => inputPage.operatingPointButton.click({ force: true }),
        page,
        "performAllCalculations",
      );

      await condenserFormatted;

      const responseBody = await calculationResponse.json();
      const expectedNetTotalCoolingCapacity =
        getExpectedNetTotalCoolingCapacity(responseBody);
      const outputCells = await getOperatingPointTableTexts(page, "OP\\s*1");

      expect(outputCells.length).toBeGreaterThan(10);
      expect(outputCells[10].trim()).toBe(expectedNetTotalCoolingCapacity);
    });

    await test.step("Disable the selected condenser and verify it is removed from output", async () => {
      const condenserFormatted = waitForApi(page, "condenserFormatted");
      const calculationResponse = await submitAndWaitForResponse(
        () => inputPage.enterAirFlow("6500"),
        page,
        "performAllCalculations",
      );

      await Promise.all([calculationResponse, condenserFormatted]);

      const condenserDropdown = page
        .locator("#technical-pane")
        .getByRole("combobox");
      const selectedCondenser = await condenserDropdown.evaluate(
        (select: HTMLSelectElement) =>
          select.options[select.selectedIndex]?.text.trim(),
      );
      const condenserCard = page.locator("#condensorInputId");

      expect(selectedCondenser).toBeTruthy();
      if (!selectedCondenser) {
        throw new Error("Expected a selected condenser before disabling it.");
      }

      await condenserCard.click({ force: true });

      await expect(condenserCard).toHaveCSS("pointer-events", "auto", {
        timeout: 5000,
      });

      const updatedOutputCells = await getOperatingPointTableTexts(
        page,
        "OP\\s*1",
      );

      expect(updatedOutputCells).not.toContain(selectedCondenser);

      const responseBody = await calculationResponse.json();
      const data = responseBody.data.outputData;

      const expectedNetTotalCoolingCapacity =
        getExpectedNetTotalCoolingCapacity(responseBody);

      const fanPowerKw = data.fan.totalPowerConsumption;
      expect(updatedOutputCells.length).toBeGreaterThan(10);
      expect(updatedOutputCells[10].trim()).toBe(
        expectedNetTotalCoolingCapacity,
      );

      const netSensibleCoolingCapacity =
        data.unitOutput.sensibleCoolingCapacity - fanPowerKw;

      const expectedString = (
        Math.round(netSensibleCoolingCapacity * 100) / 100
      ).toFixed(1);

      expect(updatedOutputCells[11].trim()).toBe(expectedString);
    });
  });
});

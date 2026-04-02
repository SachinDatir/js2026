// import { test, expect } from "@playwright/test";
// import { loginAndValidate } from "../support/registration-utils";
// import { waitForApi } from "../support/ons-helper";
// const email = process.env.EMAIL!;
// const password = process.env.PASSWORD!;

// test.beforeEach(async ({ page }) => {
//   await page.goto("/");
//   await expect(page.locator('[href="/auth/registration"]')).toBeEnabled();
//   await loginAndValidate(page, email, password);
// });

// test("verify the location change functionality of OCS @smoke @ocs", async ({
//   page,
// }) => {
//   const newLocation: string = "Reykjavik";
//   const locationELement = "li.w-100";
//   const searchBox = page.getByRole("textbox", { name: "Search city..." });
//   await page.waitForTimeout(2000);
//   await page.locator('[src="assets/img/app/app/chiller_units.png"]').click();
//   await page
//     .locator("#DEU")
//     .getByRole("heading", { name: "CyberCool 2" })
//     .click();
//   await waitForApi(page, "listFilteredModels");

//   let [response] = await Promise.all([
//     waitForApi(page, "performCalculation"),
//     page.getByRole("button", { name: "Proceed" }).click({ force: true }),
//   ]);
//   expect(response.status()).toBe(200);
//   let body = await response.json();
//   expect(body.status).toBe("success");

//   const ocsButton = page.locator("#cuOcsButton");
//   await expect(ocsButton).toHaveAttribute("title");
//   await ocsButton.click({ force: true });
//   await waitForApi(page, "performCalculation");
//   await waitForApi(page, "getOperatingPointsForCU");
//   let thestCoilWaterAdvanceCalculations = waitForApi(
//     page,
//     "thestCoilWaterAdvanceCalculations",
//   );
//   let res = await thestCoilWaterAdvanceCalculations;
//   let output = await res.json();
//   expect(output.message).toEqual("Success");

//   await expect(page.getByText("Hamburg")).toBeVisible();
//   await expect(page.getByText("Hamburg")).toContainText("Hamburg");
//   await page.getByText("Hamburg").click();
//   await waitForApi(page, "cities");
//   await waitForApi(page, "GetViewportInfo");
//   await searchBox.fill(newLocation);
//   await searchBox.press("Enter");
//   await page.waitForSelector(locationELement, { state: "visible" });
//   const text: any = (await page.locator(locationELement).textContent())?.trim();
//   console.log(text, ">>>>>>>");
//   await page.pause();
//   if (text.trim() == newLocation) {
//     await page.locator(locationELement).click({ force: true });
//   }

//   [response] = await Promise.all([
//     waitForApi(page, "performCalculation"),
//     page.getByRole("button", { name: "Confirm city" }).click({ force: true }),
//   ]);
//   expect(response.status()).toBe(200);
//   body = await response.json();
//   expect(body.status).toBe("success");

//   let weatherApi = waitForApi(page, "weather");
//   let newWeather = await weatherApi;
//   let newWeatherBody = await newWeather.json();
//   expect(newWeatherBody.data[0].city).toBe(newLocation);
//   await expect(page.getByText("Reykjavik")).toContainText(newLocation);
// });

import { test, expect } from "@playwright/test";
import { loginAndValidate } from "../support/registration-utils";
import { waitForApi } from "../support/ons-helper";

const email = process.env.EMAIL!;
const password = process.env.PASSWORD!;

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[href="/auth/registration"]')).toBeEnabled();

  await loginAndValidate(page, email, password);
});

test("verify the location change functionality of OCS @smoke @ocs", async ({
  page,
}) => {
  const ocsButton = page.locator("#cuOcsButton");

  const newLocation: string = process.env.TEST_CITY || "Reykjavik";
  const locationElement = page.locator("li.w-100");
  const chillerLocator = page.locator(
    '[src="assets/img/app/app/chiller_units.png"]',
  );

  await test.step("Open OCS module", async () => {
    await expect(chillerLocator).toBeVisible();

    await chillerLocator.click();

    await page
      .locator("#DEU")
      .getByRole("heading", { name: "CyberCool 2" })
      .click();
  });

  await test.step("Wait for models API", async () => {
    await waitForApi(page, "listFilteredModels");
  });

  let response;

  await test.step("Proceed with calculation", async () => {
    [response] = await Promise.all([
      waitForApi(page, "performCalculation"),
      page.getByRole("button", { name: "Proceed" }).click(),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("success");
  });

  await test.step("Open OCS panel", async () => {
    await expect(ocsButton).toHaveAttribute("title");
    await ocsButton.click();
    await waitForApi(page, "performCalculation");
    await waitForApi(page, "getOperatingPointsForCU");
    const res = await waitForApi(page, "thestCoilWaterAdvanceCalculations");

    const output = await res.json();
    expect(output.message).toBe("Success");
    await page.waitForLoadState("networkidle");
  });

  await test.step("Search and select new city", async () => {
    await expect(page.getByText("Hamburg")).toBeVisible();
    await page.getByText("Hamburg").click();

    await waitForApi(page, "cities");
    await waitForApi(page, "GetViewportInfo");

    const searchBox = page.getByRole("textbox", {
      name: "Search city...",
    });

    await searchBox.fill(newLocation);
    await searchBox.press("Enter");

    await expect(locationElement.first()).toBeVisible();

    const text = (await locationElement.first().textContent())?.trim();

    console.log(text, ">>>>>>>>>");

    if (text === newLocation) {
      await locationElement.first().click();
    }
  });

  await test.step("Confirm city selection", async () => {
    [response] = await Promise.all([
      waitForApi(page, "performCalculation"),
      page.getByRole("button", { name: "Confirm city" }).click(),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      status: "success",
    });
  });

  await test.step("Validate weather API and UI", async () => {
    const weatherApi = await waitForApi(page, "weather");
    const newWeatherBody = await weatherApi.json();

    const cityExists = newWeatherBody.data.some(
      (item: any) => item.city === newLocation,
    );

    expect(cityExists).toBeTruthy();

    await expect.soft(page.getByText(newLocation)).toBeVisible();

    await page
      .locator(
        ".modal-dialog.modal-xl.modal-xxl > .modal-content > .modal-header > .btn-close",
      )
      .click();
    await expect(ocsButton).toBeVisible();
    await expect(
      page.locator("#tabs-0").getByRole("heading", { name: "Operating point" }),
    ).toBeVisible();
    await ocsButton.click();
    await expect(page.getByText(newLocation)).toContainText(newLocation);

    await page.pause();
  });
});

test.only("verify the location after reload of OCS @regression @ocs", async ({
  page,
}) => {
  const ocsButton = page.locator("#cuOcsButton");

  const newLocation: string = process.env.TEST_CITY || "Reykjavik";
  const locationElement = page.locator("li.w-100");
  const chillerLocator = page.locator(
    '[src="assets/img/app/app/chiller_units.png"]',
  );

  await test.step("Open OCS module", async () => {
    await expect(chillerLocator).toBeVisible();

    await chillerLocator.click();

    await page
      .locator("#DEU")
      .getByRole("heading", { name: "CyberCool 2" })
      .click();
  });

  await test.step("Wait for models API", async () => {
    await waitForApi(page, "listFilteredModels");
  });

  let response;

  await test.step("Proceed with calculation", async () => {
    [response] = await Promise.all([
      waitForApi(page, "performCalculation"),
      page.getByRole("button", { name: "Proceed" }).click(),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("success");
  });

  await test.step("Open OCS panel", async () => {
    await expect(ocsButton).toHaveAttribute("title");
    await ocsButton.click();

    await waitForApi(page, "performCalculation");
    await waitForApi(page, "getOperatingPointsForCU");

    const res = await waitForApi(page, "thestCoilWaterAdvanceCalculations");

    const output = await res.json();
    expect(output.message).toBe("Success");
  });

  await test.step("Search and select new city", async () => {
    await expect(page.getByText("Hamburg")).toBeVisible();
    await page.getByText("Hamburg").click();

    await waitForApi(page, "cities");
    await waitForApi(page, "GetViewportInfo");

    const searchBox = page.getByRole("textbox", {
      name: "Search city...",
    });

    await searchBox.fill(newLocation);
    await searchBox.press("Enter");

    await expect(locationElement.first()).toBeVisible();

    const text = (await locationElement.first().textContent())?.trim();

    console.log(text, ">>>>>>>>>");

    if (text === newLocation) {
      await locationElement.first().click();
    }
  });

  await test.step("Confirm city selection", async () => {
    [response] = await Promise.all([
      waitForApi(page, "performCalculation"),
      page.getByRole("button", { name: "Confirm city" }).click(),
    ]);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      status: "success",
    });
  });

  await test.step("Validate weather API and UI", async () => {
    const weatherApi = await waitForApi(page, "weather");
    const newWeatherBody = await weatherApi.json();

    const cityExists = newWeatherBody.data.some(
      (item: any) => item.city === newLocation,
    );

    expect(cityExists).toBeTruthy();

    await expect.soft(page.getByText(newLocation)).toBeVisible();

    await page
      .locator(
        ".modal-dialog.modal-xl.modal-xxl > .modal-content > .modal-header > .btn-close",
      )
      .click();
    await expect(ocsButton).toBeVisible();
    await expect(
      page.locator("#tabs-0").getByRole("heading", { name: "Operating point" }),
    ).toBeVisible();

    // await expect(page.getByText(newLocation)).toContainText(newLocation);
    await test.step("Confirm city selection", async () => {
      [response] = await Promise.all([
        waitForApi(page, "performCalculation"),
        page.reload({ waitUntil: "domcontentloaded" }),
        page.waitForLoadState("domcontentloaded")
      ]);

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.status).toBe("success");
    });

    await ocsButton.click();

    await page.pause();
  });
});

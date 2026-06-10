import { expect, test } from "@playwright/test";
import { waitForApi } from "../../../../support/utils/wait-utils";
import fs from "fs";
import path from "path";
import * as mammoth from "mammoth";

test("Validate the upload file functionality in playwright", async ({
  context,
}) => {
  const downloadPath = path.resolve(process.cwd(), "test-downloads");

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  // 2. Create the folder if it doesn't exist
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  const page = await context.newPage();
  const pdfToWord = page.locator('a[title="PDF to Word"]');
  await page.goto("https://www.ilovepdf.com/", {
    waitUntil: "domcontentloaded",
  });
  await expect(pdfToWord).toBeVisible();

  //   await page.pause();

  (await pdfToWord.click({ force: true }),
    await page.waitForURL("**\/pdf_to_word"));
  await page.waitForTimeout(1000);
  //   await page.waitForSelector("#pickfiles");
  let upload = waitForApi(page, "/upload");
  await page.setInputFiles(
    '#uploader input[type="file"]',
    "tests/fixtures/ASD 171 A.pdf",
  );
  await upload;
  await page.locator("#processTask").click();
  (await page.waitForSelector("#download")).isVisible();
  await expect(page.locator(".box>.title2")).toHaveText(
    "Your PDF has been converted to an editable WORD document",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download").click();
  const download = await downloadPromise;
  const fullPath = path.join(downloadPath, download.suggestedFilename());
  await download.saveAs(fullPath);

  // 5. Log it so you can see where it went!
  console.log(`File saved to: ${fullPath}`);

  // Verify the file actually exists on disk
  expect(fs.existsSync(fullPath)).toBeTruthy();
  const buffer = fs.readFileSync(fullPath);
  const result = await mammoth.extractRawText({ buffer });
  const extractedText = result.value;

  console.log("Document Content:", extractedText);

  // Assert that the document contains what you expect
  expect(extractedText).toContain("ASD 171 A");
});

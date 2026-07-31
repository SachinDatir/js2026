import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const testEnvironment = process.env.TEST_ENV ?? "local";
const environmentFile = path.resolve(`.env.${testEnvironment}`);

if (!fs.existsSync(environmentFile)) {
  throw new Error(
    `Missing environment file: .env.${testEnvironment}. Create it from .env.${testEnvironment}.example.`,
  );
}

dotenv.config({ path: environmentFile });

const baseURL = process.env.BASE_URL;
const usesApiAuthentication = testEnvironment === "local";
const storageState = `playwright/.auth/${testEnvironment}.json`;

if (!baseURL) {
  throw new Error(`Missing BASE_URL in .env.${testEnvironment}.`);
}
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* These tests share app state, so keep them isolated. */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  timeout: 100_000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,
    viewport: { width: 1302, height: 320 },
     launchOptions: {
      args: ["--disable-dev-shm-usage"],
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    ...(usesApiAuthentication
      ? [{ name: "setup", testMatch: /.*\.setup\.ts/ }]
      : []),
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState,
      },
      ...(usesApiAuthentication ? { dependencies: ["setup"] } : {}),
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

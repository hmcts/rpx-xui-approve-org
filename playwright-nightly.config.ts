require('./playwright-env');
import { defineConfig, devices } from '@playwright/test';
import { resolveReporters, resolveWorkerCount } from './playwright-reporting';

const { version: appVersion } = require('./package.json');
const fs = require('node:fs');
const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const smokeSpecPattern = 'playwright_tests_new/smoke/**/*.spec.ts';
const migratedE2ESpecPattern = 'playwright_tests_new/E2E/test/**/*.spec.ts';
const baseUrl = process.env.TEST_URL || 'https://administer-orgs.aat.platform.hmcts.net/';
const workerCount = resolveWorkerCount(process.env);

fs.mkdirSync('test-results', { recursive: true });

module.exports = defineConfig({
  outputDir: 'test-results',
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000,
  },
  reportSlowTests: null,

  /* Opt out of parallel tests on CI. */
  workers: workerCount,

  reporter: resolveReporters(
    {
      defaultIndexFilename: 'xui-playwright-e2e.html',
      defaultProject: 'RPX XUI Approve Organisations',
      defaultRelease: appVersion,
      defaultTitle: 'RPX XUI Approve Organisations Playwright',
      includeJunit: true,
    },
    baseUrl,
    process.env
  ),

  projects: [
    {
      name: 'chromium',
      testMatch: [migratedE2ESpecPattern],
      testIgnore: [smokeSpecPattern],
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: 15 * 1000,
        channel: 'chrome',
        headless: headlessMode,
        trace: 'retain-on-failure',
        screenshot: {
          mode: 'only-on-failure',
          fullPage: true,
        },
        video: 'off',
      },
    },
    {
      name: 'firefox',
      testMatch: [migratedE2ESpecPattern],
      testIgnore: [smokeSpecPattern],
      use: {
        ...devices['Desktop Firefox'],
        actionTimeout: 15 * 1000,
        screenshot: {
          mode: 'only-on-failure',
          fullPage: true,
        },
        video: 'off',
        headless: headlessMode,
        trace: 'retain-on-failure',
      },
    },
    {
      name: 'webkit',
      testMatch: [migratedE2ESpecPattern],
      testIgnore: [smokeSpecPattern],
      use: {
        ...devices['Desktop Safari'],
        actionTimeout: 15 * 1000,
        screenshot: {
          mode: 'only-on-failure',
          fullPage: true,
        },
        video: 'off',
        headless: headlessMode,
        trace: 'retain-on-failure',
      },
    },
  ],
});

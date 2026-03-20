require('./playwright-env');
import { defineConfig, devices } from '@playwright/test';
import { resolveReporters, resolveWorkerCount } from './playwright-reporting';

const { version: appVersion } = require('./package.json');
const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const smokeSpecPattern = 'playwright_tests/smoke.test.ts';
const legacyFunctionalSpecs = [
  'playwright_tests/active-org.test.ts',
  'playwright_tests/login.test.ts',
  'playwright_tests/tabs-load.test.ts'
];
const migratedE2ESpecPattern = 'playwright_tests_new/E2E/**/*.spec.ts';
const baseUrl = process.env.TEST_URL || 'https://administer-orgs.aat.platform.hmcts.net/';
const workerCount = resolveWorkerCount(process.env);

module.exports = defineConfig({
  use: {
    baseURL: baseUrl
  },
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000
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
      includeJunit: true
    },
    baseUrl,
    process.env
  ),

  projects: [
    {
      name: 'chromium',
      testMatch: [...legacyFunctionalSpecs, migratedE2ESpecPattern],
      testIgnore: [smokeSpecPattern, 'playwright_tests/org-workflows.test.ts'],
      use: { ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        trace: 'on-first-retry'
      }
    },
    {
      name: 'smoke',
      testMatch: [smokeSpecPattern],
      use: { ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
      }
    }
  ]
});

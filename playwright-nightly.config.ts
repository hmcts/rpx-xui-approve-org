require('./playwright-env');
import { defineConfig, devices } from '@playwright/test';
import { resolveReporters, resolveWorkerCount } from './playwright-reporting';

const { version: appVersion } = require('./package.json');
const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const smokeSpecPattern = 'playwright_tests/smoke.test.ts';
const baseUrl = process.env.TEST_URL || 'https://administer-orgs.aat.platform.hmcts.net/';
const workerCount = resolveWorkerCount(process.env);

module.exports = defineConfig({
  testDir: './playwright_tests',
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
    process.env,
  ),

  projects: [
    {
      name: 'chromium',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Chrome'],
        actionTimeout: 15 * 1000,
        channel: 'chrome',
        headless: headlessMode,
        trace: 'on-first-retry'
      }
    },
    {
      name: 'firefox',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Firefox'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    },
    {
      name: 'webkit',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Safari'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    }
  ]
});

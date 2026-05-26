import { defineConfig, devices } from '@playwright/test';
import * as fs from 'node:fs';
import { getSessionStatePath } from './playwright_tests/helpers/sessionCapture';
import { resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const sharedStorageStatePath = getSessionStatePath('base');
const sharedStorageState = fs.existsSync(sharedStorageStatePath) ? sharedStorageStatePath : undefined;

module.exports = defineConfig({
  testDir: './playwright_tests',
  testIgnore: ['**/api/**', '**/integration/**'],
  globalSetup: require.resolve('./playwright_tests/helpers/playwright.global.setup.ts'),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 120_000,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,

  /* Opt out of parallel tests on CI. */
  workers: resolveWorkerCount(),

  reporter: buildPlaywrightReporters('e2e'),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        storageState: sharedStorageState,
        trace: 'on-first-retry'
      }
    }
  ]
});

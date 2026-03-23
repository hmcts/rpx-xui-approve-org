require('./playwright-env');

import { defineConfig, devices } from '@playwright/test';

const headlessMode = process.env.HEAD !== 'true';

module.exports = defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000,
  },
  workers: process.env.FUNCTIONAL_TESTS_WORKERS ? parseInt(process.env.FUNCTIONAL_TESTS_WORKERS, 10) : 1,
  outputDir: 'test-results-new',
  reporter: [[process.env.CI ? 'html' : 'list'], ['html', { open: 'never', outputFolder: 'functional-output/tests/playwright-e2e-new' }]],
  use: {
    baseURL: process.env.TEST_URL || process.env.EXUI_BASE_URL || 'https://administer-orgs.aat.platform.hmcts.net/',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: ['playwright_tests_new/E2E/test/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
      },
    },
    {
      name: 'smoke',
      testMatch: ['playwright_tests_new/smoke/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
      },
    },
  ],
});

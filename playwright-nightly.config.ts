import { defineConfig, devices } from '@playwright/test';

const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';

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
  workers: process.env.FUNCTIONAL_TESTS_WORKERS ? parseInt(process.env.FUNCTIONAL_TESTS_WORKERS, 10) : 1,

  reporter: [[process.env.CI ? 'html' : 'list'],
    ['html', { open: 'never', outputFolder: 'functional-output/tests/playwright-e2e' }]],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
        actionTimeout: 15 * 1000,
        channel: 'chrome',
        headless: headlessMode,
        trace: 'on-first-retry'
      }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    }
  ]
});

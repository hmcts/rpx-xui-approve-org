import { defineConfig, devices } from '@playwright/test';
import { resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';

module.exports = defineConfig({
  testDir: './playwright_tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000
  },
  reportSlowTests: null,
  workers: resolveWorkerCount(),
  reporter: buildPlaywrightReporters('integration'),
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        trace: 'on-first-retry'
      }
    }
  ]
});

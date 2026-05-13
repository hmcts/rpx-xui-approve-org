import { defineConfig } from '@playwright/test';
import { resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

module.exports = defineConfig({
  testDir: './playwright_tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000
  },
  reportSlowTests: null,
  workers: resolveWorkerCount(),
  reporter: buildPlaywrightReporters('api'),
  use: {
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'api'
    }
  ]
});

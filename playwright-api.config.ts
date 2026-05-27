import { defineConfig } from '@playwright/test';
import { resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

process.env.PW_AUTH_SESSION_USER = process.env.PW_AUTH_SESSION_USER || 'api';

module.exports = defineConfig({
  testDir: './playwright_tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  timeout: 180_000,
  expect: {
    timeout: 60_000
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

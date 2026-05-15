import { defineConfig } from '@playwright/test';
import { resolveWorkerCount } from './playwright-config-utils';

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
  reporter: [[process.env.CI ? 'html' : 'list'],
    ['html', { open: 'never', outputFolder: 'functional-output/tests/playwright-api' }]],
  use: {
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'api'
    }
  ]
});

import { defineConfig } from '@playwright/test';

module.exports = defineConfig({
  testDir: './playwright_tests/api',
  testMatch: /.*\.unit\.api\.test\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  reporter: process.env.PLAYWRIGHT_DEFAULT_REPORTER || 'list',
  workers: 1,
  projects: [
    {
      name: 'reporting-unit'
    }
  ]
});

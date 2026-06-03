import { defineConfig } from '@playwright/test';
import { resolveTagFilters, resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

process.env.PW_AUTH_SESSION_USER = process.env.PW_AUTH_SESSION_USER || 'api';
const apiTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'API_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'API_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'API_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/api/tag-filter.json',
});

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
      name: 'api',
      grep: apiTagFilters.grep,
      grepInvert: apiTagFilters.grepInvert
    }
  ]
});

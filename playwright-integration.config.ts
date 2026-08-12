import { defineConfig, devices } from '@playwright/test';
import {
  logResolvedTagFilters,
  resolveFunctionalRetryCount,
  resolveFunctionalTagFilters,
  resolveWorkerCount
} from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
const integrationTagFilters = resolveFunctionalTagFilters({
  includeTagsEnvVar: 'INTEGRATION_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'INTEGRATION_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/integration/tag-filter.json'
});
logResolvedTagFilters('Integration', integrationTagFilters);

module.exports = defineConfig({
  testDir: './playwright_tests/integration',
  testMatch: /.*\.integration\.(positive|negative)\.test\.ts/,
  globalSetup: require.resolve('./playwright_tests/helpers/playwright.integration.global.setup.ts'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: resolveFunctionalRetryCount('INTEGRATION_PW_RETRIES'),
  timeout: 180_000,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,
  workers: resolveWorkerCount(),
  reporter: buildPlaywrightReporters('integration'),
  projects: [
    {
      name: 'chromium',
      grep: integrationTagFilters.grep,
      grepInvert: integrationTagFilters.grepInvert,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
      }
    }
  ]
});

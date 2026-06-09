import { defineConfig, devices } from '@playwright/test';
import { resolveTagFilters, resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
const integrationTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'INTEGRATION_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'INTEGRATION_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/integration/tag-filter.json',
  suiteTag: '@integration',
});

module.exports = defineConfig({
  testDir: './playwright_tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
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

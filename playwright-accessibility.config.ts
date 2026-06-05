import { defineConfig, devices } from '@playwright/test';
import { resolveTagFilters, resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';

const accessibilityTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'A11Y_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'A11Y_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'A11Y_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/accessibility/tag-filter.json',
  suiteTag: '@accessibility',
});

module.exports = defineConfig({
  testDir: './playwright_tests/accessibility',
  globalSetup: require.resolve('./playwright_tests/helpers/playwright.global.setup.ts'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 120_000,
  expect: {
    timeout: 60_000,
  },
  reportSlowTests: null,
  workers: resolveWorkerCount(),
  reporter: buildPlaywrightReporters('accessibility'),
  projects: [
    {
      name: 'chromium',
      grep: accessibilityTagFilters.grep,
      grepInvert: accessibilityTagFilters.grepInvert,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
      },
    },
  ],
});

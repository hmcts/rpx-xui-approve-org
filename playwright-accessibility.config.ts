import { defineConfig, devices } from '@playwright/test';
import { resolveTagFilters, resolveWorkerCount } from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
const configuredEngines = (process.env.A11Y_ENGINES ?? process.env.PLAYWRIGHT_A11Y_ENGINES ?? '')
  .split(',')
  .map((engine) => engine.trim().toLowerCase())
  .filter(Boolean);
const lighthouseEnabled = configuredEngines.includes('all') || configuredEngines.includes('lighthouse');
const lighthousePort = Number.parseInt(process.env.PW_LIGHTHOUSE_PORT ?? '9222', 10);
const accessibilityTimeout = lighthouseEnabled
  ? Number.parseInt(process.env.PW_LIGHTHOUSE_A11Y_TEST_TIMEOUT_MS ?? '180000', 10)
  : Number.parseInt(process.env.PW_A11Y_TEST_TIMEOUT_MS ?? '120000', 10);
const accessibilityWorkers = lighthouseEnabled ? 1 : resolveWorkerCount();

const accessibilityTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'A11Y_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'A11Y_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'A11Y_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/accessibility/tag-filter.json',
  suiteTag: '@accessibility'
});

module.exports = defineConfig({
  testDir: './playwright_tests/accessibility',
  testMatch: /.*\.test\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: accessibilityTimeout,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,
  workers: accessibilityWorkers,
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
        trace: 'off',
        ...(lighthouseEnabled
          ? {
            launchOptions: {
              args: [`--remote-debugging-port=${lighthousePort}`]
            }
          }
          : {})
      }
    }
  ]
});

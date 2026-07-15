import { defineConfig, devices } from '@playwright/test';
import {
  logResolvedTagFilters,
  resolveFunctionalTagFilters,
  resolveWorkerCount
} from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const e2eTagFilters = resolveFunctionalTagFilters({
  includeTagsEnvVar: 'E2E_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'E2E_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'E2E_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/e2e/tag-filter.json',
  suiteTag: '@e2e'
});
logResolvedTagFilters('Nightly cross-browser E2E', e2eTagFilters);

module.exports = defineConfig({
  testDir: './playwright_tests/e2e',
  testMatch: /.*\.test\.ts/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 180_000,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,

  /* Opt out of parallel tests on CI. */
  workers: resolveWorkerCount(),

  reporter: buildPlaywrightReporters('nightly'),

  projects: [
    {
      name: 'firefox',
      grep: e2eTagFilters.grep,
      grepInvert: e2eTagFilters.grepInvert,
      use: { ...devices['Desktop Firefox'],
        actionTimeout: 15_000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    },
    {
      name: 'webkit',
      grep: e2eTagFilters.grep,
      grepInvert: e2eTagFilters.grepInvert,
      use: { ...devices['Desktop Safari'],
        actionTimeout: 15_000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    }
  ]
});

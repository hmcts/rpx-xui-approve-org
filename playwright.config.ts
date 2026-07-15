import { defineConfig, devices } from '@playwright/test';
import * as fs from 'node:fs';
import { getSessionStatePath } from './playwright_tests/helpers/sessionCapture';
import {
  GLOBAL_EXCLUSION_TAG_CATALOG_PATHS,
  logResolvedTagFilters,
  resolveTagFilters,
  resolveWorkerCount
} from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const sharedStorageStatePath = getSessionStatePath('base');
const sharedStorageState = fs.existsSync(sharedStorageStatePath) ? sharedStorageStatePath : undefined;
const e2eTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'E2E_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'E2E_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'E2E_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/e2e/tag-filter.json',
  suiteTag: '@e2e',
  globalExcludedTagsEnvVar: 'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS',
  ignoreGlobalExcludesEnvVar: 'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES',
  globalTagCatalogPaths: GLOBAL_EXCLUSION_TAG_CATALOG_PATHS
});
logResolvedTagFilters('E2E', e2eTagFilters);

module.exports = defineConfig({
  testDir: './playwright_tests/e2e',
  testMatch: /.*\.test\.ts/,
  globalSetup: require.resolve('./playwright_tests/helpers/playwright.global.setup.ts'),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 120_000,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,

  /* Opt out of parallel tests on CI. */
  workers: resolveWorkerCount(),

  reporter: buildPlaywrightReporters('e2e'),

  projects: [
    {
      name: 'chromium',
      grep: e2eTagFilters.grep,
      grepInvert: e2eTagFilters.grepInvert,
      use: { ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: headlessMode,
        storageState: sharedStorageState,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
      }
    }
  ]
});

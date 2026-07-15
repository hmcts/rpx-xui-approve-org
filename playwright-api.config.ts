import { defineConfig } from '@playwright/test';
import {
  GLOBAL_EXCLUSION_TAG_CATALOG_PATHS,
  logResolvedTagFilters,
  resolveTagFilters,
  resolveWorkerCount
} from './playwright-config-utils';
import { buildPlaywrightReporters } from './playwright-reporting';

process.env.PW_AUTH_SESSION_USER = process.env.PW_AUTH_SESSION_USER || 'api';

function resolvePositiveInteger(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value?.trim() ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function resolveApiRetries(): number {
  const configured = resolvePositiveInteger(process.env.API_PW_RETRIES);
  if (configured !== undefined) {
    return configured;
  }

  return 3;
}

function resolveApiWorkerCount(): number {
  return resolvePositiveInteger(process.env.API_PW_WORKERS) ?? resolveWorkerCount();
}

const apiTagFilters = resolveTagFilters({
  includeTagsEnvVar: 'API_PW_INCLUDE_TAGS',
  excludedTagsEnvVar: 'API_PW_EXCLUDED_TAGS_OVERRIDE',
  configPathEnvVar: 'API_PW_TAG_FILTER_CONFIG',
  defaultConfigPath: 'playwright_tests/api/tag-filter.json',
  globalExcludedTagsEnvVar: 'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS',
  ignoreGlobalExcludesEnvVar: 'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES',
  globalTagCatalogPaths: GLOBAL_EXCLUSION_TAG_CATALOG_PATHS
});
logResolvedTagFilters('API', apiTagFilters);

module.exports = defineConfig({
  testDir: './playwright_tests/api',
  testMatch: /.*\.(positive|negative)\.api\.test\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: resolveApiRetries(),
  timeout: 180_000,
  expect: {
    timeout: 60_000
  },
  reportSlowTests: null,
  workers: resolveApiWorkerCount(),
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

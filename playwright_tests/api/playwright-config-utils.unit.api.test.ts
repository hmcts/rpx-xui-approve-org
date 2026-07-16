import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  logResolvedTagFilters,
  resolveFunctionalTagFilters,
  resolveTagFilters,
  splitTagInput,
  type ResolvedTagFilters
} from '../../playwright-config-utils';

let smokeRunner: {
  buildSmokePlaywrightArgs: (env?: NodeJS.ProcessEnv, extraArgs?: string[]) => string[];
};

const temporaryConfigPaths: string[] = [];

test.beforeAll(async () => {
  const smokeModule = await import('../../scripts/run-playwright-smoke.cjs');
  smokeRunner = (smokeModule.default ?? smokeModule) as typeof smokeRunner;
});

test.afterEach(() => {
  for (const configPath of temporaryConfigPaths.splice(0)) {
    fs.rmSync(path.dirname(configPath), { recursive: true, force: true });
  }
});

test('deduplicates space and comma separated tags', () => {
  expect(splitTagInput('@search organisations,@search organisations')).toEqual([
    '@search',
    '@organisations'
  ]);
});

test('adds catalog-scoped global exclusions to checked-in defaults', () => {
  const filters = resolveForCatalog(
    ['@search', '@organisations'],
    {
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@search @other-suite @none search'
    },
    ['@organisations'],
    ['@search', '@organisations', '@other-suite']
  );

  expect(filters.excludedTags).toEqual(['@organisations', '@search']);
  expect(filters.globalExcludedTags).toEqual(['@search']);
  expect(filters.ignoredGlobalExcludedTags).toEqual(['@other-suite']);
  expect(filters.globalExcludesBypassed).toBe(false);
  expect(filters.grepInvert?.test('@search')).toBe(true);
});

test('keeps suite override replacement semantics before adding global exclusions', () => {
  const filters = resolveForCatalog(
    ['@default', '@override', '@global'],
    {
      SUITE_EXCLUDES: '@override',
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@global @override'
    },
    ['@default']
  );

  expect(filters.excludedTags).toEqual(['@override', '@global']);
  expect(filters.globalExcludedTags).toEqual(['@global', '@override']);
});

test('treats @none as a global no-op without clearing suite exclusions', () => {
  const filters = resolveForCatalog(
    ['@default'],
    {
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@none'
    },
    ['@default']
  );

  expect(filters.excludedTags).toEqual(['@default']);
  expect(filters.globalExcludedTags).toEqual([]);
  expect(filters.ignoredGlobalExcludedTags).toEqual([]);
});

test('rejects a global exclusion absent from the functional catalog union', () => {
  expect(() =>
    resolveForCatalog(
      ['@search'],
      {
        PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@serach'
      },
      [],
      ['@search', '@api-only']
    )
  ).toThrow(/PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS contains unknown tag\(s\): @serach/);
});

test('bypasses only global exclusions', () => {
  const filters = resolveForCatalog(
    ['@default', '@global'],
    {
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@global',
      PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES: 'yes'
    },
    ['@default']
  );

  expect(filters.excludedTags).toEqual(['@default']);
  expect(filters.globalExcludedTags).toEqual([]);
  expect(filters.ignoredGlobalExcludedTags).toEqual(['@global']);
  expect(filters.globalExcludesBypassed).toBe(true);
  expect(filters.excludedTagsSource).toBe('env');
});

test('bypasses validation for an obsolete global exclusion', () => {
  const filters = resolveForCatalog(
    ['@default'],
    {
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@obsolete-tag',
      PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES: 'true'
    },
    ['@default']
  );

  expect(filters.excludedTags).toEqual(['@default']);
  expect(filters.globalExcludedTags).toEqual([]);
  expect(filters.ignoredGlobalExcludedTags).toEqual(['@obsolete-tag']);
  expect(filters.globalExcludesBypassed).toBe(true);
});

test('rejects the whole-suite @e2e tag as a global exclusion', () => {
  expect(() =>
    resolveForCatalog(['@e2e', '@smoke'], { PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@e2e' })
  ).toThrow(/PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS cannot exclude whole-suite tag\(s\): @e2e/);
});

test('allows the smoke journey to be globally excluded through its safe package runner', () => {
  const filters = resolveForCatalog(['@e2e', '@smoke'], { PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@smoke' });

  expect(filters.globalExcludedTags).toEqual(['@smoke']);
  expect(filters.grepInvert?.test('journey @smoke')).toBe(true);
  expect(smokeRunner.buildSmokePlaywrightArgs({ PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@smoke' })).toEqual([
    'test',
    'playwright_tests/e2e/login.test.ts',
    '-c',
    'playwright.config.ts',
    '--pass-with-no-tests',
    '--reporter=list'
  ]);
  expect(
    smokeRunner.buildSmokePlaywrightArgs({
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@smoke',
      PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES: 'true'
    })
  ).toEqual(['test', 'playwright_tests/e2e/login.test.ts', '-c', 'playwright.config.ts']);
  expect(
    smokeRunner.buildSmokePlaywrightArgs(
      { PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: 'smoke' },
      ['--reporter=null', '--list']
    )
  ).toEqual([
    'test',
    'playwright_tests/e2e/login.test.ts',
    '-c',
    'playwright.config.ts',
    '--reporter=null',
    '--list',
    '--pass-with-no-tests'
  ]);
});

test('matches an excluded tag exactly without suppressing longer tag names', () => {
  const filters = resolveForCatalog(
    ['@organisations', '@organisations-by-id', '@organisations-write'],
    { PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@organisations' }
  );

  expect(filters.grepInvert?.test('test @organisations')).toBe(true);
  expect(filters.grepInvert?.test('test @organisations-by-id')).toBe(false);
  expect(filters.grepInvert?.test('test @organisations-write')).toBe(false);
});

test('applies a shared global tag to every suite catalog that declares it', () => {
  const env = {
    PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@search @api-only'
  };
  const knownGlobalTags = ['@e2e', '@search', '@integration-only', '@api-only'];
  const e2eFilters = resolveForCatalog(['@e2e', '@search'], env, [], knownGlobalTags);
  const integrationFilters = resolveForCatalog(['@search', '@integration-only'], env, [], knownGlobalTags);
  const apiFilters = resolveForCatalog(['@api-only'], env, [], knownGlobalTags);

  expect(e2eFilters.globalExcludedTags).toEqual(['@search']);
  expect(integrationFilters.globalExcludedTags).toEqual(['@search']);
  expect(apiFilters.globalExcludedTags).toEqual(['@api-only']);
});

test('builds global validation from functional catalog path overrides', () => {
  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-functional-tag-filter-'));
  const apiConfigPath = path.join(configDir, 'api.json');
  const e2eConfigPath = path.join(configDir, 'e2e.json');
  const integrationConfigPath = path.join(configDir, 'integration.json');
  fs.writeFileSync(apiConfigPath, JSON.stringify({ availableTags: ['@custom-api'] }));
  fs.writeFileSync(e2eConfigPath, JSON.stringify({ availableTags: ['@e2e', '@custom-e2e'] }));
  fs.writeFileSync(integrationConfigPath, JSON.stringify({ availableTags: ['@custom-integration'] }));
  temporaryConfigPaths.push(apiConfigPath);

  const filters = resolveFunctionalTagFilters({
    env: {
      API_PW_TAG_FILTER_CONFIG: apiConfigPath,
      E2E_PW_TAG_FILTER_CONFIG: e2eConfigPath,
      INTEGRATION_PW_TAG_FILTER_CONFIG: integrationConfigPath,
      PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS: '@custom-api @custom-e2e @custom-integration'
    },
    includeTagsEnvVar: 'E2E_PW_INCLUDE_TAGS',
    excludedTagsEnvVar: 'E2E_PW_EXCLUDED_TAGS_OVERRIDE',
    configPathEnvVar: 'E2E_PW_TAG_FILTER_CONFIG',
    defaultConfigPath: 'unused-e2e-catalog.json',
    suiteTag: '@e2e'
  });

  expect(filters.globalExcludedTags).toEqual(['@custom-e2e']);
  expect(filters.ignoredGlobalExcludedTags).toEqual(['@custom-api', '@custom-integration']);
});

test('logs applied, ignored and bypass diagnostics when requested', () => {
  const writes: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((value: string) => {
    writes.push(value);
    return true;
  }) as typeof process.stdout.write;

  try {
    logResolvedTagFilters(
      'E2E',
      {
        includeTags: [],
        excludedTags: ['@search'],
        globalExcludedTags: ['@search'],
        ignoredGlobalExcludedTags: ['@api-only'],
        globalExcludesBypassed: false,
        availableTags: ['@search'],
        grepInvert: /@search/,
        excludedTagsSource: 'env',
        configPath: path.resolve('playwright_tests/e2e/tag-filter.json')
      },
      { PLAYWRIGHT_LOG_TAG_FILTERS: 'true' }
    );
  } finally {
    process.stdout.write = originalWrite;
  }

  expect(writes.join('')).toContain('globalApplied=@search');
  expect(writes.join('')).toContain('globalIgnored=@api-only');
  expect(writes.join('')).toContain('globalBypassed=false');
  expect(writes).toHaveLength(1);
  expect(writes[0].endsWith('\n')).toBe(true);
  expect(writes[0]).not.toContain('\\n');
});

function resolveForCatalog(
  availableTags: string[],
  env: NodeJS.ProcessEnv,
  excludedTags: string[] = [],
  knownGlobalTags: string[] = availableTags
): ResolvedTagFilters {
  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-tag-filter-'));
  const configPath = path.join(configDir, 'tag-filter.json');
  const globalCatalogPath = path.join(configDir, 'global-tag-filter.json');
  fs.writeFileSync(configPath, JSON.stringify({ availableTags, excludedTags }));
  fs.writeFileSync(globalCatalogPath, JSON.stringify({ availableTags: knownGlobalTags }));
  temporaryConfigPaths.push(configPath);

  return resolveTagFilters({
    env,
    includeTagsEnvVar: 'SUITE_INCLUDES',
    excludedTagsEnvVar: 'SUITE_EXCLUDES',
    configPathEnvVar: 'SUITE_CONFIG',
    defaultConfigPath: configPath,
    globalExcludedTagsEnvVar: 'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS',
    ignoreGlobalExcludesEnvVar: 'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES',
    globalTagCatalogPaths: [globalCatalogPath]
  });
}

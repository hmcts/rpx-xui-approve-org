import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const repoRoot = path.resolve(__dirname, '../..');
const functionalConfigs = [
  'playwright.config.ts',
  'playwright-api.config.ts',
  'playwright-integration.config.ts',
  'playwright-nightly.config.ts'
];

test('wires global exclusions to API, E2E, integration and nightly but not accessibility', () => {
  for (const configPath of functionalConfigs) {
    const source = read(configPath);
    expect(source).toContain('globalExcludedTagsEnvVar: \'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'');
    expect(source).toContain('ignoreGlobalExcludesEnvVar: \'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES\'');
    expect(source).toContain('globalTagCatalogPaths: GLOBAL_EXCLUSION_TAG_CATALOG_PATHS');
    expect(source).toContain('logResolvedTagFilters(');
  }

  const accessibilitySource = read('playwright-accessibility.config.ts');
  expect(accessibilitySource).not.toContain('PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS');
  expect(accessibilitySource).not.toContain('PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES');
});

test('maps the approve-org Key Vault secret in CNP and nightly Jenkins only', () => {
  for (const jenkinsfile of ['Jenkinsfile_CNP', 'Jenkinsfile_nightly']) {
    const source = read(jenkinsfile);
    expect(source).toContain(
      'secret(\'xui-approve-org-playwright-global-excluded-tags\', \'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\')'
    );
    expect(source).toContain('PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES');

    const secretIndex = source.indexOf(
      'secret(\'xui-approve-org-playwright-global-excluded-tags\', \'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\')'
    );
    expect(source.slice(0, secretIndex).trimEnd().endsWith(',')).toBe(true);
  }

  const cnpSource = read('Jenkinsfile_CNP');
  expect(cnpSource).toContain('name: \'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES\'');
  expect(cnpSource).toContain(
    'env.PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES = params.PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES ? \'true\' : \'false\''
  );

  const nightlySource = read('Jenkinsfile_nightly');
  expect(nightlySource).toContain(
    'final String ignoreGlobalExcludesEnvName = \'PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES\''
  );
  expect(nightlySource).toContain('name: ignoreGlobalExcludesEnvName');
  expect(nightlySource).toContain(
    'env."${ignoreGlobalExcludesEnvName}" = params."${ignoreGlobalExcludesEnvName}" ? \'true\' : \'false\''
  );

  const parameterizedSource = read('Jenkinsfile_parameterized');
  expect(parameterizedSource).not.toContain('xui-approve-org-playwright-global-excluded-tags');
  expect(parameterizedSource).not.toContain('PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES');
});

test('documents the global list and bypass in the env template', () => {
  const envTemplate = read('.env.example');

  expect(envTemplate).toContain('PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS=@none');
  expect(envTemplate).toContain('PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES=');
});

test('builds the global known-tag union from all functional suite catalogs', () => {
  const resolverSource = read('playwright-config-utils.ts');

  expect(resolverSource).toContain('\'playwright_tests/api/tag-filter.json\'');
  expect(resolverSource).toContain('\'playwright_tests/e2e/tag-filter.json\'');
  expect(resolverSource).toContain('\'playwright_tests/integration/tag-filter.json\'');
  expect(resolverSource).not.toContain('\'playwright_tests/accessibility/tag-filter.json\'');
});

test('declares shared @search in both E2E and integration catalogs', () => {
  const e2eCatalog = JSON.parse(read('playwright_tests/e2e/tag-filter.json'));
  const integrationCatalog = JSON.parse(read('playwright_tests/integration/tag-filter.json'));

  expect(e2eCatalog.availableTags).toContain('@search');
  expect(integrationCatalog.availableTags).toContain('@search');
});

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
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
    expect(source).toContain('resolveFunctionalTagFilters({');
    expect(source).toContain('logResolvedTagFilters(');
  }

  const accessibilitySource = read('playwright-accessibility.config.ts');
  expect(accessibilitySource).not.toContain('resolveFunctionalTagFilters');
});

test('maps the approve-org Key Vault secret in CNP and nightly Jenkins only', () => {
  for (const jenkinsfile of ['Jenkinsfile_CNP', 'Jenkinsfile_nightly']) {
    const source = read(jenkinsfile);
    expect(source).toContain(
      'secret(\'xui-approve-org-playwright-global-excluded-tags\', \'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\')'
    );
    expect(source).toContain('PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES');
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

test('declares shared @search in both E2E and integration catalogs', () => {
  const e2eCatalog = JSON.parse(read('playwright_tests/e2e/tag-filter.json'));
  const integrationCatalog = JSON.parse(read('playwright_tests/integration/tag-filter.json'));

  expect(e2eCatalog.availableTags).toContain('@search');
  expect(integrationCatalog.availableTags).toContain('@search');
});

test('keeps RefData and known product defects out of the default E2E catalog', () => {
  const e2eCatalog = JSON.parse(read('playwright_tests/e2e/tag-filter.json'));

  expect(e2eCatalog.excludedTags).toContain('@refdata-search');
  expect(e2eCatalog.excludedTags).toContain('@known-product-defect');
  expect(e2eCatalog.excludedTags).not.toContain('@refdata-list');
  expect(e2eCatalog.availableTags).toContain('@active-org');
  expect(e2eCatalog.availableTags).toContain('@tabs-load');
});

test('quarantines known product defects without reporting skipped integration tests', () => {
  const integrationCatalog = JSON.parse(read('playwright_tests/integration/tag-filter.json'));

  expect(integrationCatalog.excludedTags).toContain('@known-product-defect');
  expect(integrationCatalog.availableTags).toContain('@known-product-defect');

  for (const specPath of [
    'playwright_tests/integration/active-organisations.integration.negative.test.ts',
    'playwright_tests/integration/pending-organisations.integration.negative.test.ts',
    'playwright_tests/integration/pending-pbas.integration.negative.test.ts'
  ]) {
    const source = read(specPath);
    expect(source).toContain('@known-product-defect');
    expect(source).not.toContain('test.skip');
  }
});

test('keeps active organisation browser coverage in the opt-in RefData route', () => {
  const searchSource = read('playwright_tests/e2e/organisation-search.test.ts');
  const tabsSource = read('playwright_tests/e2e/tabs-load.test.ts');

  expect(searchSource).toContain('Search by organisation in active organisations');
  expect(tabsSource).toContain('test(\'Active organisations tab loads data\', { tag: \'@refdata-search\' }');
  expect(tabsSource).toContain('RefData failed while loading the Active organisations tab');
  expect(searchSource).toContain('RefData failed while opening Active organisations for search');
});

test('proves the reviewed workflow verifies its durable REVIEW state', () => {
  const workflowSource = read('playwright_tests/e2e/org-workflows.test.ts');
  const pageObjectSource = read('playwright_tests/page-objects/pages/exui/organisation-approvals.page.ts');

  expect(workflowSource).toContain('organisationStatusBadge).toHaveText(\'UNDER REVIEW\')');
  expect(workflowSource).toContain('chooseDecision(/Place registration under review/i)).toBeChecked()');
  expect(pageObjectSource).toContain('app-identity-bar-component .hmcts-badge');
});

test('routes every RefData-backed organisation search through the opt-in API lane', () => {
  const source = read('playwright_tests/api/organisations.positive.api.test.ts');

  expect(source).toMatch(
    /test\(\s*'POST \/api\/organisations search: active organisation search with empty search term returns a bounded envelope',\s*\{ tag: '@refdata-search' \}/
  );
});

test('provides an opt-in non-blocking Jenkins route for RefData search tests', () => {
  for (const jenkinsfile of ['Jenkinsfile_CNP', 'Jenkinsfile_nightly']) {
    const source = read(jenkinsfile);

    expect(source).toContain('RUN_REFDATA_SEARCH_TESTS');
    expect(source).toContain('RefData Search Playwright Tests');
    expect(source).toContain('\'API_PW_INCLUDE_TAGS=@refdata-search\'');
    expect(source).toContain('\'E2E_PW_INCLUDE_TAGS=@refdata-search\'');
    expect(source).toContain('\'API_PW_EXCLUDED_TAGS_OVERRIDE=@none\'');
    expect(source).toContain('\'E2E_PW_EXCLUDED_TAGS_OVERRIDE=@none\'');
    expect(source).toContain('catchError(buildResult: \'SUCCESS\', stageResult: \'UNSTABLE\')');
    expect(source).toContain('\'PLAYWRIGHT_REPORT_FOLDER=functional-output/tests/playwright-refdata/api-odhin-report\'');
    expect(source).toContain('\'PLAYWRIGHT_REPORT_FOLDER=functional-output/tests/playwright-refdata/e2e-odhin-report\'');
    expect(source).toContain('publishRefDataSearchReports');
    expect(source).toContain('reportDir            : playwrightRefDataApiReportDir');
    expect(source).toContain('reportFiles          : playwrightRefDataApiReportFile');
    expect(source).toContain('reportDir            : playwrightRefDataE2eReportDir');
    expect(source).toContain('reportFiles          : playwrightRefDataE2eReportFile');
    expect(source).toContain('artifacts: \'functional-output/tests/playwright-refdata/**/*\'');
    expect(source.indexOf('parallel(playwrightBranches)')).toBeLessThan(source.indexOf('RefData Search Playwright Tests'));

    if (jenkinsfile === 'Jenkinsfile_CNP') {
      expect(source).toContain('publishRefDataSearchReports(\'PREVIEW\')');
      expect(source).toContain('publishRefDataSearchReports(\'AAT\')');
    } else {
      expect(source).toContain('publishRefDataSearchReports(\'Nightly\')');
    }
  }
});

test('keeps independent update-PBA suites parallel so one failure cannot skip the remaining cases', () => {
  for (const specPath of [
    'playwright_tests/api/update-pba.positive.api.test.ts',
    'playwright_tests/api/update-pba.negative.api.test.ts'
  ]) {
    expect(read(specPath)).not.toContain('test.describe.configure({ mode: \'serial\' })');
  }
});

test('local env population prefers the exact AO exclusion secret', () => {
  const result = runLocalEnvPopulation([
    'if [[ "$1 $2 $3" == "keyvault secret show" && "$*" == *"--name xui-approve-org-playwright-global-excluded-tags"* ]]; then echo "@ao-only"; exit 0; fi',
    'if [[ "$1 $2 $3" == "keyvault secret list" ]]; then echo "https://vault/secrets/mc-or-mo"; exit 0; fi'
  ]);

  expect(result.output).toContain('PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS="@ao-only"');
  expect(result.commandLog).toContain(
    'keyvault secret show --vault-name rpx-aat --name xui-approve-org-playwright-global-excluded-tags'
  );
  expect(result.commandLog).not.toContain('tags.e2e==\'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'');
});

test('does not use metadata fallback when the exact AO exclusion secret lookup fails', () => {
  const result = runLocalEnvPopulation([
    'if [[ "$1 $2 $3" == "keyvault secret show" && "$*" == *"--name xui-approve-org-playwright-global-excluded-tags"* ]]; then exit 1; fi',
    'if [[ "$1 $2 $3" == "keyvault secret list" && "$*" == *"tags.e2e==\'APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'"* ]]; then echo "https://vault/secrets/ao-global"; exit 0; fi',
    'if [[ "$1 $2 $3" == "keyvault secret list" && "$*" == *"tags.e2e==\'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'"* ]]; then echo "https://vault/secrets/mc-global"; exit 0; fi',
    'if [[ "$1 $2 $3" == "keyvault secret show" && "$*" == *"--id "* ]]; then echo "@foreign-value"; exit 0; fi'
  ]);

  expect(result.output).toContain('PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS="@none"');
  expect(result.output).not.toContain('@foreign-value');
  expect(result.commandLog).toContain(
    'keyvault secret show --vault-name rpx-aat --name xui-approve-org-playwright-global-excluded-tags'
  );
  expect(result.commandLog).not.toContain('tags.e2e==\'APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'');
  expect(result.commandLog).not.toContain('tags.e2e==\'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS\'');
  expect(result.commandLog).not.toContain('--id ');
});

function runLocalEnvPopulation(fakeAzBehavior: string[]): { output: string; commandLog: string } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-key-vault-wiring-'));
  const fakeBinDir = path.join(tempDir, 'bin');
  const fakeAzPath = path.join(fakeBinDir, 'az');
  const commandLogPath = path.join(tempDir, 'az-commands.log');
  const templatePath = path.join(tempDir, '.env.example');
  const outputPath = path.join(tempDir, '.env');
  fs.mkdirSync(fakeBinDir);
  fs.writeFileSync(templatePath, 'PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS=@none\n');
  fs.writeFileSync(fakeAzPath, [
    '#!/usr/bin/env bash',
    'printf "%s\\n" "$*" >> "$FAKE_AZ_LOG"',
    'if [[ "$1 $2" == "account show" ]]; then exit 0; fi',
    'if [[ "$1 $2 $3" == "keyvault secret list" && "$*" == *"--maxresults 1"* ]]; then echo "https://vault/secrets/health"; exit 0; fi',
    ...fakeAzBehavior,
    'exit 1'
  ].join('\n'));
  fs.chmodSync(fakeAzPath, 0o755);

  try {
    execFileSync('bash', [
      path.join(repoRoot, 'scripts/populate-env-from-keyvault.sh'),
      'aat',
      outputPath,
      templatePath
    ], {
      env: {
        ...process.env,
        FAKE_AZ_LOG: commandLogPath,
        PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH ?? ''}`
      },
      stdio: 'pipe'
    });

    return {
      output: fs.readFileSync(outputPath, 'utf8'),
      commandLog: fs.readFileSync(commandLogPath, 'utf8')
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

import { ReporterDescription } from '@playwright/test';
import { execSync } from 'node:child_process';
import { cpus, totalmem } from 'node:os';
import { version as appVersion } from './package.json';

/**
 * Resolves the test environment from the baseURL
 */
function resolveEnvironmentFromUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return 'local';
  }
  const normalizedUrl = baseUrl.toLowerCase();

  if (normalizedUrl.includes('localhost')) {
    return 'local';
  }
  if (normalizedUrl.includes('127.0.0.1')) {
    return 'local';
  }

  // Preview environments follow hostnames like xui-ao-webapp-pr-1039.preview.platform.hmcts.net
  if (normalizedUrl.includes('.preview.') || /-pr-\d+\.preview\./.test(normalizedUrl)) {
    return 'preview';
  }

  if (normalizedUrl.includes('dev')) {
    return 'dev';
  }
  if (normalizedUrl.includes('staging')) {
    return 'staging';
  }
  if (normalizedUrl.includes('aat')) {
    return 'aat';
  }
  if (normalizedUrl.includes('prod')) {
    return 'prod';
  }
  return 'unknown';
}

/**
 * Resolves the test environment from process environment variables
 */
function resolveTestEnvironment(): string {
  const testUrl = process.env.TEST_URL || '';
  const buildEnv = process.env.BUILD_ENV || '';

  if (testUrl) {
    return resolveEnvironmentFromUrl(testUrl);
  }

  if (buildEnv) {
    return buildEnv.toLowerCase();
  }

  return 'local';
}

function resolveDefaultReporter(): string {
  const configured = process.env.PLAYWRIGHT_DEFAULT_REPORTER?.trim();
  if (configured && ['dot', 'list', 'line'].includes(configured)) {
    return configured;
  }

  return process.env.CI ? 'dot' : 'list';
}

function resolveBranchName(): string {
  const envBranch =
    process.env.PLAYWRIGHT_REPORT_BRANCH ||
    process.env.GIT_BRANCH ||
    process.env.BRANCH_NAME ||
    process.env.GITHUB_REF_NAME ||
    process.env.GITHUB_HEAD_REF ||
    process.env.BUILD_SOURCEBRANCHNAME;

  if (envBranch) {
    return envBranch.replace(/^refs\/heads\//, '').trim();
  }

  try {
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .trim()
      .replace(/^refs\/heads\//, '');

    if (gitBranch && gitBranch !== 'HEAD') {
      return gitBranch;
    }
  } catch {
    // Fall back to local label when branch cannot be resolved.
  }

  return 'local';
}

function resolveReportRoot(reportType: 'e2e' | 'api' | 'nightly' | 'integration' | 'accessibility'): string {
  if (process.env.PLAYWRIGHT_REPORT_FOLDER?.trim()) {
    return process.env.PLAYWRIGHT_REPORT_FOLDER.trim();
  }

  switch (reportType) {
    case 'api':
      return 'functional-output/tests/playwright-api/odhin-report';
    case 'integration':
      return 'functional-output/tests/playwright-integration/odhin-report';
    case 'nightly':
      return 'functional-output/tests/playwright-nightly/odhin-report';
    case 'accessibility':
      return 'functional-output/tests/playwright-accessibility/odhin-report';
    case 'e2e':
    default:
      return 'functional-output/tests/playwright-e2e/odhin-report';
  }
}

function resolveIndexFilename(reportType: 'e2e' | 'api' | 'nightly' | 'integration' | 'accessibility'): string {
  if (process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME?.trim()) {
    return process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME.trim();
  }

  switch (reportType) {
    case 'api':
      return 'xui-ao-playwright-api.html';
    case 'integration':
      return 'xui-ao-playwright-integration.html';
    case 'nightly':
      return 'xui-ao-playwright-nightly.html';
    case 'accessibility':
      return 'xui-ao-playwright-accessibility.html';
    case 'e2e':
    default:
      return 'xui-ao-playwright-e2e.html';
  }
}

function resolveTitle(reportType: 'e2e' | 'api' | 'nightly' | 'integration' | 'accessibility'): string {
  if (process.env.PW_ODHIN_TITLE?.trim()) {
    return process.env.PW_ODHIN_TITLE.trim();
  }

  return `XUI AO ${reportType.toUpperCase()} Report`;
}

function resolveTestEnvironmentLabel(workerCount = process.env.FUNCTIONAL_TESTS_WORKERS || 'auto'): string {
  const environment = resolveTestEnvironment();
  const runContext = process.env.CI ? 'ci' : 'local-run';
  const cpuCores = cpus()?.length ?? 'unknown';
  const totalRamGiB = Math.round((totalmem() / 1024 ** 3) * 10) / 10;

  return `${environment} | ${runContext} | workers=${workerCount} | agent_cpu_cores=${cpuCores} | agent_ram_gib=${totalRamGiB}`;
}

/**
 * Builds Playwright reporters array with Ohdin configured
 * @param reportType - Type of report (e2e, api, nightly, integration, or accessibility)
 * @returns Array of reporter configurations
 */
export function buildPlaywrightReporters(reportType: 'e2e' | 'api' | 'nightly' | 'integration' | 'accessibility' = 'e2e'): ReporterDescription[] {
  const disableOhdin = process.env.DISABLE_ODHIN_REPORTER === 'true';
  const testFolder = reportType === 'api'
    ? 'playwright_tests/api'
    : reportType === 'integration'
      ? 'playwright_tests/integration'
      : reportType === 'accessibility'
        ? 'playwright_tests/accessibility'
        : 'playwright_tests';

  const defaultReporter = resolveDefaultReporter();
  const releaseTag = process.env.PLAYWRIGHT_REPORT_RELEASE || `${appVersion} | branch=${resolveBranchName()}`;
  const odhinOutputFolder = resolveReportRoot(reportType);

  const reporters: ReporterDescription[] = [
    [defaultReporter],
    [
      './playwright_tests/common/reporters/odhin-adaptive.reporter.cjs',
      {
        outputFolder: odhinOutputFolder,
        indexFilename: resolveIndexFilename(reportType),
        testFolder,
        title: resolveTitle(reportType),
        testEnvironment: resolveTestEnvironmentLabel(),
        project: process.env.PLAYWRIGHT_REPORT_PROJECT || process.env.ODHIN_PROJECT_NAME || 'rpx-xui-approve-org',
        release: releaseTag,
        startServer: false,
        consoleLog: true,
        consoleError: true,
        simpleConsoleLog: !!process.env.CI,
        testOutput: 'only-on-failure'
      }
    ]
  ];

  if (disableOhdin) {
    return [[defaultReporter]];
  }

  if (process.env.PLAYWRIGHT_JUNIT_OUTPUT?.trim()) {
    reporters.push(['junit', { outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT.trim() }]);
  }

  return reporters;
}

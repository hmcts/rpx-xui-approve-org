import { ReporterDescription } from '@playwright/test';
import { execSync } from 'node:child_process';
import { cpus, totalmem } from 'node:os';

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

function resolveHtmlOutputFolder(reportType: 'e2e' | 'api' | 'nightly' | 'integration' | 'accessibility'): string {
  if (process.env.PLAYWRIGHT_HTML_OUTPUT?.trim()) {
    return process.env.PLAYWRIGHT_HTML_OUTPUT.trim();
  }
  return `functional-output/tests/playwright-${reportType}/html-report`;
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

function resolveNonNegativeInteger(raw: string | undefined, fallback: number): number {
  if (raw === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
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
  const packageVersion = process.env.npm_package_version || '0.0.0';
  const releaseTag = process.env.PLAYWRIGHT_REPORT_RELEASE || `${packageVersion} | branch=${resolveBranchName()}`;
  const odhinOutputFolder = resolveReportRoot(reportType);

  const reporters: ReporterDescription[] = [
    [defaultReporter],
    ['./playwright_tests/common/reporters/flake-gate.reporter.cjs'],
    ['html', { outputFolder: resolveHtmlOutputFolder(reportType), open: 'never' }]
  ];
  if (process.env.PW_ENABLE_PERFETTO !== 'false') {
    reporters.push([
      'perfetto',
      { outputFile: process.env.PLAYWRIGHT_PERFETTO_OUTPUT_FILE || `functional-output/tests/playwright-${reportType}/test-results/perfetto.json` }
    ]);
  }

  if (!disableOhdin) {
    reporters.push([
      './playwright_tests/common/reporters/odhin-progress.reporter.cjs',
      {
        graceMs: resolveNonNegativeInteger(process.env.PW_ODHIN_PROGRESS_GRACE_MS, 1500),
        intervalMs: resolveNonNegativeInteger(process.env.PW_ODHIN_PROGRESS_INTERVAL_MS, 5000),
        hardTimeoutMs: resolveNonNegativeInteger(process.env.PW_ODHIN_PROGRESS_HARD_TIMEOUT_MS, 0),
        timeoutExitCode: 1,
        completionExitDelayMs: resolveNonNegativeInteger(process.env.PW_ODHIN_COMPLETION_EXIT_DELAY_MS, 0),
        forceExitOnCompletion: process.env.PW_ODHIN_FORCE_EXIT_ON_COMPLETION === 'true'
      }
    ]);
    reporters.push([
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
        testOutput: 'only-on-failure',
        ...(process.env.PW_ODHIN_LIGHTWEIGHT === undefined ? {} : { lightweight: process.env.PW_ODHIN_LIGHTWEIGHT === 'true' }),
        ...(process.env.PW_ODHIN_PROFILE === undefined ? {} : { profile: process.env.PW_ODHIN_PROFILE === 'true' }),
        ...(process.env.PW_ODHIN_RUNTIME_HOOK_TIMEOUT_MS === undefined
          ? {}
          : { runtimeHookTimeoutMs: resolveNonNegativeInteger(process.env.PW_ODHIN_RUNTIME_HOOK_TIMEOUT_MS, 15_000) }),
        ...(process.env.PW_ODHIN_FINALIZATION_TIMEOUT_MS === undefined
          ? {}
          : { finalizationTimeoutMs: resolveNonNegativeInteger(process.env.PW_ODHIN_FINALIZATION_TIMEOUT_MS, 30_000) }),
        ...(process.env.PW_ODHIN_TRIM_FAILED_ARTIFACTS === undefined
          ? {}
          : { trimFailedArtifacts: process.env.PW_ODHIN_TRIM_FAILED_ARTIFACTS === 'true' }),
        strictReportValidity: process.env.PW_ODHIN_STRICT_REPORT !== 'false'
      }
    ]);
  }

  if (process.env.CI && reportType !== 'accessibility') {
    reporters.push([
      'json',
      { outputFile: `${odhinOutputFolder}/ci-evidence/playwright.json` }
    ]);
  }

  if (process.env.PLAYWRIGHT_JUNIT_OUTPUT?.trim()) {
    reporters.push(['junit', { outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT.trim() }]);
  }

  return reporters;
}

import { ReporterDescription } from '@playwright/test';

/**
 * Resolves the test environment from the baseURL
 */
function resolveEnvironmentFromUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return 'local';
  }
  if (baseUrl.includes('localhost')) {
    return 'local';
  }
  if (baseUrl.includes('127.0.0.1')) {
    return 'local';
  }
  if (baseUrl.includes('dev')) {
    return 'dev';
  }
  if (baseUrl.includes('staging')) {
    return 'staging';
  }
  if (baseUrl.includes('aat')) {
    return 'aat';
  }
  if (baseUrl.includes('prod')) {
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

/**
 * Builds Playwright reporters array with Ohdin configured
 * @param reportType - Type of report (e2e, api, nightly, or integration)
 * @returns Array of reporter configurations
 */
export function buildPlaywrightReporters(reportType: 'e2e' | 'api' | 'nightly' | 'integration' = 'e2e'): ReporterDescription[] {
  const isCI = !!process.env.CI;
  const environment = resolveTestEnvironment();
  const reportFolder = process.env.PLAYWRIGHT_REPORT_FOLDER || 'functional-output/tests';
  const buildTag = process.env.BUILD_TAG || 'local-run';
  const releaseTag = process.env.PLAYWRIGHT_RELEASE_TAG || buildTag;
  const disableOhdin = process.env.DISABLE_ODHIN_REPORTER === 'true';

  const reportOutput = (() => {
    switch (reportType) {
      case 'api':
        return `${reportFolder}/playwright-api`;
      case 'integration':
        return `${reportFolder}/playwright-integration`;
      case 'nightly':
        return `${reportFolder}/playwright-nightly`;
      case 'e2e':
      default:
        return `${reportFolder}/playwright-e2e`;
    }
  })();

  const testFolder = reportType === 'api'
    ? 'playwright_tests/api'
    : reportType === 'integration'
      ? 'playwright_tests/integration'
      : 'playwright_tests';

  const odhinOutputFolder = reportOutput;

  const reporters: ReporterDescription[] = [
    [isCI ? 'dot' : 'list'],
    [
      'odhin-reports-playwright',
      {
        outputFolder: odhinOutputFolder,
        indexFilename: 'index.html',
        testFolder,
        title: `XUI AO ${reportType.toUpperCase()} Report`,
        testEnvironment: environment,
        project: process.env.ODHIN_PROJECT_NAME || 'rpx-xui-approve-org',
        release: releaseTag,
        // Disable server startup to prevent CI job hanging
        startServer: false,
        consoleLog: true,
        simpleConsoleLog: isCI
      }
    ]
  ];

  if (disableOhdin) {
    return [[isCI ? 'dot' : 'list']];
  }

  return reporters;
}

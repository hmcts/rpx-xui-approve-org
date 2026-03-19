import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

const headlessMode = process.env.HEAD !== 'true';
export const axeTestEnabled = process.env.ENABLE_AXE_TESTS === 'true';
const smokeSpecPattern = 'playwright_tests/smoke.test.ts';
const htmlOutputFolder = process.env.PLAYWRIGHT_HTML_OUTPUT || 'functional-output/tests/playwright-e2e';

const resolveDefaultReporter = (): string => {
  const configured = process.env.PLAYWRIGHT_DEFAULT_REPORTER?.trim();
  return configured || (process.env.CI ? 'dot' : 'list');
};

const resolveReporters = (): ReporterDescription[] => {
  const configured = process.env.PLAYWRIGHT_REPORTERS
    ?.split(',')
    .map((reporter) => reporter.trim())
    .filter(Boolean);
  const reporterNames = configured?.length
    ? configured
    : [resolveDefaultReporter(), 'html', ...(process.env.CI ? ['junit'] : [])];
  const uniqueReporterNames = [...new Set(reporterNames)];

  return uniqueReporterNames.map((reporterName) => {
    switch (reporterName.toLowerCase()) {
      case 'html':
        return ['html', { open: process.env.PLAYWRIGHT_HTML_OPEN || 'never', outputFolder: htmlOutputFolder }];
      case 'junit':
        return ['junit', { outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT || 'playwright-junit.xml' }];
      case 'dot':
        return ['dot'];
      case 'line':
        return ['line'];
      case 'list':
        return ['list'];
      default:
        return [reporterName];
    }
  });
};

module.exports = defineConfig({
  testDir: './playwright_tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 3, // Set the number of retries for all projects

  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 1 * 60 * 1000
  },
  reportSlowTests: null,

  /* Opt out of parallel tests on CI. */
  workers: process.env.FUNCTIONAL_TESTS_WORKERS ? parseInt(process.env.FUNCTIONAL_TESTS_WORKERS, 10) : 1,

  reporter: resolveReporters(),

  projects: [
    {
      name: 'chromium',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Chrome'],
        actionTimeout: 15 * 1000,
        channel: 'chrome',
        headless: headlessMode,
        trace: 'on-first-retry'
      }
    },
    {
      name: 'firefox',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Firefox'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    },
    {
      name: 'webkit',
      testIgnore: [smokeSpecPattern],
      use: { ...devices['Desktop Safari'],
        actionTimeout: 15 * 1000,
        screenshot: 'only-on-failure',
        headless: headlessMode,
        trace: 'off'
      }
    }
  ]
});

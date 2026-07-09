#!/usr/bin/env node

/* global process, require */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require('node:child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { enhanceGeneratedReport } = require('../playwright_tests/common/reporters/odhin-report-enhancer.cjs');

const extraArgs = process.argv.slice(2);
if (extraArgs[0] === '--') {
  extraArgs.shift();
}

const defaultEngines = 'axe,wave-like,screen-reader';

const env = {
  ...process.env,
  A11Y_ENGINES: process.env.A11Y_ENGINES || process.env.PLAYWRIGHT_A11Y_ENGINES || defaultEngines,
  PLAYWRIGHT_A11Y_ENGINES: process.env.PLAYWRIGHT_A11Y_ENGINES || process.env.A11Y_ENGINES || defaultEngines,
  A11Y_PW_INCLUDE_TAGS: process.env.A11Y_PW_INCLUDE_TAGS || '@accessibility',
  PLAYWRIGHT_JUNIT_OUTPUT:
    process.env.PLAYWRIGHT_JUNIT_OUTPUT || 'functional-output/tests/playwright-accessibility/playwright-accessibility-junit.xml',
  PLAYWRIGHT_REPORT_FOLDER:
    process.env.PLAYWRIGHT_REPORT_FOLDER || 'functional-output/tests/playwright-accessibility/odhin-report',
  PLAYWRIGHT_REPORT_INDEX_FILENAME:
    process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME || 'xui-ao-playwright-accessibility.html',
  PLAYWRIGHT_REPORT_PROJECT: process.env.PLAYWRIGHT_REPORT_PROJECT || 'RPX XUI Approve Org - Accessibility',
  PW_ODHIN_TITLE: process.env.PW_ODHIN_TITLE || 'RPX-XUI-APPROVE-ORG Accessibility',
  FUNCTIONAL_TESTS_WORKERS: process.env.PW_ACCESSIBILITY_WORKERS || process.env.FUNCTIONAL_TESTS_WORKERS || '1',
  PW_SKIP_SESSION_CAPTURE: process.env.PW_SKIP_SESSION_CAPTURE || 'true',
  PW_ODHIN_TRIM_FAILED_ARTIFACTS: process.env.PW_ODHIN_TRIM_FAILED_ARTIFACTS || 'true',
  PW_ODHIN_FINALIZATION_TIMEOUT_MS: process.env.PW_ODHIN_FINALIZATION_TIMEOUT_MS || '30000',
  PLAYWRIGHT_DEFAULT_REPORTER: process.env.PLAYWRIGHT_DEFAULT_REPORTER || 'line'
};

const result = spawnSync(
  'npx',
  ['playwright', 'test', '-c', 'playwright-accessibility.config.ts', '--grep', '@accessibility', ...extraArgs, '--retries=0'],
  { env, stdio: 'inherit' }
);

try {
  enhanceGeneratedReport(env.PLAYWRIGHT_REPORT_FOLDER, []);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[accessibility-report] Unable to enhance generated Odhín report: ${message}\n`);
}

const status = result.status ?? 1;
if (status !== 0) {
  process.stderr.write(
    `[accessibility-report] Accessibility pack completed with status ${status}; returning failure so Jenkins can mark the accessibility stage unstable.\n`
  );
}

process.exit(status);

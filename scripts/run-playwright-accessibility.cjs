#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const extraArgs = process.argv.slice(2);
if (extraArgs[0] === '--') {
  extraArgs.shift();
}

const strictMode = ['1', 'true', 'yes', 'on'].includes((process.env.A11Y_STRICT || '').trim().toLowerCase());
const isListOnlyRun = extraArgs.includes('--list');

const env = {
  ...process.env,
  A11Y_ENGINES: process.env.A11Y_ENGINES || process.env.PLAYWRIGHT_A11Y_ENGINES || 'all',
  PLAYWRIGHT_A11Y_ENGINES: process.env.PLAYWRIGHT_A11Y_ENGINES || process.env.A11Y_ENGINES || 'all',
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
  PW_A11Y_PREWARM_SESSION: isListOnlyRun ? 'false' : process.env.PW_A11Y_PREWARM_SESSION || 'true',
  PW_ODHIN_TRIM_FAILED_ARTIFACTS: process.env.PW_ODHIN_TRIM_FAILED_ARTIFACTS || 'true',
  PW_ODHIN_FINALIZATION_TIMEOUT_MS: process.env.PW_ODHIN_FINALIZATION_TIMEOUT_MS || '30000',
  PLAYWRIGHT_DEFAULT_REPORTER: process.env.PLAYWRIGHT_DEFAULT_REPORTER || 'line'
};

const result = spawnSync(
  'npx',
  ['playwright', 'test', '-c', 'playwright-accessibility.config.ts', '--grep', '@accessibility', ...extraArgs, '--retries=0'],
  { env, stdio: 'inherit' }
);

const status = result.status ?? 1;
if (status !== 0 && !strictMode) {
  process.stderr.write(
    `[accessibility-report] Accessibility pack completed with status ${status}; A11Y_STRICT is off so the run is report-only.\n`
  );
  process.exit(0);
}

process.exit(status);

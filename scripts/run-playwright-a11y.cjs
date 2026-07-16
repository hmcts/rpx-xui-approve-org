#!/usr/bin/env node

process.env.A11Y_ENGINES = process.env.A11Y_ENGINES || 'axe';
process.env.PLAYWRIGHT_A11Y_ENGINES = process.env.PLAYWRIGHT_A11Y_ENGINES || process.env.A11Y_ENGINES;
process.env.PLAYWRIGHT_JUNIT_OUTPUT =
  process.env.PLAYWRIGHT_JUNIT_OUTPUT || 'functional-output/tests/playwright-a11y/playwright-a11y-junit.xml';
process.env.PLAYWRIGHT_REPORT_FOLDER =
  process.env.PLAYWRIGHT_REPORT_FOLDER || 'functional-output/tests/playwright-a11y/odhin-report';
process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME = process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME || 'xui-ao-playwright-a11y.html';
process.env.PW_ODHIN_TITLE = process.env.PW_ODHIN_TITLE || 'RPX-XUI-APPROVE-ORG Axe Accessibility';
process.env.FUNCTIONAL_TESTS_WORKERS = process.env.PW_A11Y_WORKERS || process.env.FUNCTIONAL_TESTS_WORKERS || '1';

require('./run-playwright-accessibility.cjs');

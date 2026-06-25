#!/usr/bin/env node

process.env.A11Y_ENGINES = process.env.A11Y_ENGINES || 'lighthouse';
process.env.PLAYWRIGHT_A11Y_ENGINES = process.env.PLAYWRIGHT_A11Y_ENGINES || process.env.A11Y_ENGINES;
process.env.PLAYWRIGHT_JUNIT_OUTPUT =
  process.env.PLAYWRIGHT_JUNIT_OUTPUT ||
  'functional-output/tests/playwright-lighthouse-a11y/playwright-lighthouse-a11y-junit.xml';
process.env.PLAYWRIGHT_REPORT_FOLDER =
  process.env.PLAYWRIGHT_REPORT_FOLDER || 'functional-output/tests/playwright-lighthouse-a11y/odhin-report';
process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME =
  process.env.PLAYWRIGHT_REPORT_INDEX_FILENAME || 'xui-ao-playwright-lighthouse-a11y.html';
process.env.PLAYWRIGHT_REPORT_PROJECT = process.env.PLAYWRIGHT_REPORT_PROJECT || 'RPX XUI Approve Org - Lighthouse Accessibility';
process.env.PW_ODHIN_TITLE = process.env.PW_ODHIN_TITLE || 'RPX-XUI-APPROVE-ORG Lighthouse Accessibility';
process.env.FUNCTIONAL_TESTS_WORKERS =
  process.env.PW_LIGHTHOUSE_A11Y_WORKERS || process.env.FUNCTIONAL_TESTS_WORKERS || '1';

require('./run-playwright-accessibility.cjs');

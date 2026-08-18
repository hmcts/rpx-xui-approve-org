import { expect, test } from '@playwright/test';

import { buildPlaywrightReporters } from '../../playwright-reporting';

test('includes flake, HTML, Odhín and JUnit reporters for an API lane', () => {
  const original = {
    PLAYWRIGHT_DEFAULT_REPORTER: process.env.PLAYWRIGHT_DEFAULT_REPORTER,
    PLAYWRIGHT_JUNIT_OUTPUT: process.env.PLAYWRIGHT_JUNIT_OUTPUT,
    PLAYWRIGHT_HTML_OUTPUT: process.env.PLAYWRIGHT_HTML_OUTPUT,
    DISABLE_ODHIN_REPORTER: process.env.DISABLE_ODHIN_REPORTER
  };
  process.env.PLAYWRIGHT_DEFAULT_REPORTER = 'list';
  process.env.PLAYWRIGHT_JUNIT_OUTPUT = 'reports/api-junit.xml';
  process.env.PLAYWRIGHT_HTML_OUTPUT = 'reports/api-html';
  delete process.env.DISABLE_ODHIN_REPORTER;

  try {
    expect(buildPlaywrightReporters('api')).toEqual(
      expect.arrayContaining([
        ['list'],
        ['./playwright_tests/common/reporters/flake-gate.reporter.cjs'],
        ['html', { outputFolder: 'reports/api-html', open: 'never' }],
        [
          './playwright_tests/common/reporters/odhin-adaptive.reporter.cjs',
          expect.objectContaining({ outputFolder: 'functional-output/tests/playwright-api/odhin-report' })
        ],
        ['junit', { outputFile: 'reports/api-junit.xml' }]
      ])
    );
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test('keeps flake and HTML diagnostics when Odhín is explicitly disabled', () => {
  const original = process.env.DISABLE_ODHIN_REPORTER;
  process.env.DISABLE_ODHIN_REPORTER = 'true';

  try {
    const reporters = buildPlaywrightReporters('integration');
    expect(reporters.map(([name]) => name)).toContain('./playwright_tests/common/reporters/flake-gate.reporter.cjs');
    expect(reporters.map(([name]) => name)).toContain('html');
    expect(reporters.map(([name]) => name)).not.toContain('./playwright_tests/common/reporters/odhin-adaptive.reporter.cjs');
  } finally {
    if (original === undefined) {
      delete process.env.DISABLE_ODHIN_REPORTER;
    } else {
      process.env.DISABLE_ODHIN_REPORTER = original;
    }
  }
});

test('uses distinct default HTML folders for every report lane', () => {
  const original = process.env.PLAYWRIGHT_HTML_OUTPUT;
  delete process.env.PLAYWRIGHT_HTML_OUTPUT;

  try {
    for (const lane of ['api', 'integration', 'e2e', 'accessibility'] as const) {
      const htmlReporter = buildPlaywrightReporters(lane).find(([name]) => name === 'html');
      expect(htmlReporter?.[1]).toEqual({ outputFolder: `functional-output/tests/playwright-${lane}/html-report`, open: 'never' });
    }
  } finally {
    if (original === undefined) {
      delete process.env.PLAYWRIGHT_HTML_OUTPUT;
    } else {
      process.env.PLAYWRIGHT_HTML_OUTPUT = original;
    }
  }
});

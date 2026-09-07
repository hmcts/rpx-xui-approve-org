import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FlakeSummaryReporter = require('../common/reporters/flake-gate.reporter.cjs');

test('reports flaky, retried-pass and timed-out test outcomes without changing suite status', () => {
  const writes: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((value: string) => {
    writes.push(value);
    return true;
  }) as typeof process.stdout.write;

  try {
    const reporter = new FlakeSummaryReporter();
    reporter.onTestEnd({ id: 'flaky', outcome: () => 'flaky' }, { status: 'passed', retry: 1 });
    reporter.onTestEnd({ id: 'timeout', outcome: () => 'unexpected' }, { status: 'timedOut', retry: 0 });
    reporter.onEnd();
  } finally {
    process.stdout.write = originalWrite;
  }

  const output = writes.join('');
  expect(output).toContain('[flake-summary] finished=2');
  expect(output).toContain('[flake-summary] flaky=1');
  expect(output).toContain('[flake-summary] passed-on-retry=1');
  expect(output).toContain('[flake-summary] failed=1');
  expect(output).toContain('[flake-summary] mode=report-only');
  expect(output).not.toContain('threshold');
});

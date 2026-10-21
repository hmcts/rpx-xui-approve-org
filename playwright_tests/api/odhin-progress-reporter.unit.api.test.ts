import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const OdhinProgressReporter = require('../common/reporters/odhin-progress.reporter.cjs');

test('reports Odhín finalisation without changing the Playwright result', () => {
  const writes: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;

  try {
    const reporter = new OdhinProgressReporter({ graceMs: 0, hardTimeoutMs: 0 });
    reporter.onBegin({}, { allTests: () => [1, 2] });
    reporter.onEnd({ status: 'passed' });
    reporter.onExit();
  } finally {
    process.stdout.write = originalWrite;
  }

  expect(writes.join('')).toContain('[odhin-progress] All tests finished');
  expect(writes.join('')).toContain('plannedTests=2');
  expect(writes.join('')).toContain('[odhin-progress] Odhin report completed');
});

test('uses the existing process exit code when forced completion is enabled', async () => {
  const exitCodes: number[] = [];
  const originalExitCode = process.exitCode;
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (() => true) as typeof process.stderr.write;

  try {
    process.exitCode = 3;
    const reporter = new OdhinProgressReporter({
      forceExitOnCompletion: true,
      exitProcess: (code: number) => exitCodes.push(code)
    });
    reporter.onBegin({}, { allTests: () => [1] });
    reporter.onEnd({ status: 'passed' });
    reporter.onExit();
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    process.exitCode = originalExitCode;
    process.stderr.write = originalWrite;
  }

  expect(exitCodes).toEqual([3]);
});

test('uses the injected exit process when finalisation exceeds the hard timeout', async () => {
  const exitCodes: number[] = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (() => true) as typeof process.stderr.write;

  try {
    const reporter = new OdhinProgressReporter({
      graceMs: 0,
      hardTimeoutMs: 5_000,
      timeoutExitCode: 17,
      exitProcess: (code: number) => exitCodes.push(code)
    });
    reporter.onBegin({}, { allTests: () => [1] });
    reporter.onEnd({ status: 'passed' });
    await new Promise((resolve) => setTimeout(resolve, 5_100));
    reporter.onExit();
  } finally {
    process.stderr.write = originalWrite;
  }

  expect(exitCodes).toEqual([17]);
});

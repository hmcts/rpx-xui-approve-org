import { expect, test } from '@playwright/test';

import OdhinAdaptiveReporter from '../common/reporters/odhin-adaptive.reporter.cjs';

test.describe('Odhín adaptive reporter', () => {
  test('bounds a stalled runtime callback when the test completes', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    reporter.runtimeHookTimeoutMs = 10;
    reporter.inner = {
      onTestEnd: () => new Promise(() => undefined),
      onEnd: () => Promise.resolve()
    };

    await reporter.onTestEnd({}, { status: 'passed', retry: 0, duration: 0 });
    await expect(reporter.onEnd({})).resolves.toBeUndefined();
  });

  test('does not queue test output callbacks unless explicitly enabled', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    let stdoutCalls = 0;
    let stderrCalls = 0;
    const onStdOut = () => {
      stdoutCalls += 1;
    };
    const onStdErr = () => {
      stderrCalls += 1;
    };
    reporter.inner = { onStdOut, onStdErr };

    await reporter.onStdOut('normal output', {}, {});
    await reporter.onStdErr('normal error output', {}, {});

    expect(stdoutCalls).toBe(0);
    expect(stderrCalls).toBe(0);
  });

  test('continues report enhancement after a stalled finalizer', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    reporter.statusCounts.passed = 1;
    reporter.finalizationTimeoutMs = 10;
    reporter.inner = { onEnd: () => new Promise(() => undefined) };

    await expect(reporter.onEnd({})).resolves.toBeUndefined();
  });
});

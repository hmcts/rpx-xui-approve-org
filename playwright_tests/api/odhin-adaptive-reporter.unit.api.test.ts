import { expect, test } from '@playwright/test';

import OdhinAdaptiveReporter from '../common/reporters/odhin-adaptive.reporter.cjs';

test.describe('Odhín adaptive reporter', () => {
  test('does not let a stalled runtime callback block finalisation', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    reporter.runtimeHookTimeoutMs = 10;
    reporter.inner = {
      onTestEnd: () => new Promise(() => undefined),
      onEnd: () => Promise.resolve()
    };

    await reporter.onTestEnd({}, { status: 'passed', retry: 0, duration: 0 });
    await expect(reporter.onEnd({})).resolves.toBeUndefined();
  });

  test('continues report enhancement after a stalled finalizer', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    reporter.statusCounts.passed = 1;
    reporter.finalizationTimeoutMs = 10;
    reporter.inner = { onEnd: () => new Promise(() => undefined) };

    await expect(reporter.onEnd({})).resolves.toBeUndefined();
  });
});

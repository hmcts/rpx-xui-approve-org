import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const OdhinAdaptiveReporter = require('../../../../playwright_tests_new/common/reporters/odhin-adaptive.reporter.cjs');

const odhinAdaptiveTest = OdhinAdaptiveReporter.__test__ as {
  normalizeTestOutputMode: (raw: unknown) => true | false | 'only-on-failure';
  normalizeRuntimeHookTimeoutMs: (raw: unknown, fallbackMs: number) => number;
  withTimeout: <T>(promise: Promise<T>, timeoutMs: number) => Promise<T>;
  trimResult: (
    result: Record<string, unknown>,
    options: { lightweight: boolean; testOutputMode: true | false | 'only-on-failure' }
  ) => {
    nextResult: Record<string, unknown>;
    trimmedCounts: { output: number; heavyArtifacts: number };
  };
};

describe('odhinAdaptiveReporter', () => {
  it('normalizes output mode values', () => {
    assert.equal(odhinAdaptiveTest.normalizeTestOutputMode(undefined), 'only-on-failure');
    assert.equal(odhinAdaptiveTest.normalizeTestOutputMode('true'), true);
    assert.equal(odhinAdaptiveTest.normalizeTestOutputMode('false'), false);
    assert.equal(odhinAdaptiveTest.normalizeTestOutputMode('junk'), 'only-on-failure');
  });

  it('normalizes runtime hook timeout values', () => {
    assert.equal(odhinAdaptiveTest.normalizeRuntimeHookTimeoutMs(undefined, 15000), 15000);
    assert.equal(odhinAdaptiveTest.normalizeRuntimeHookTimeoutMs('2500', 15000), 2500);
    assert.equal(odhinAdaptiveTest.normalizeRuntimeHookTimeoutMs('junk', 15000), 15000);
  });

  it('keeps passed-test steps while trimming output and attachments in lightweight mode', () => {
    const { nextResult, trimmedCounts } = odhinAdaptiveTest.trimResult(
      {
        status: 'passed',
        stdout: [{ text: 'pass out' }],
        stderr: [{ text: 'pass err' }],
        steps: [{ title: 'step' }],
        attachments: [{ name: 'trace' }],
      },
      { lightweight: true, testOutputMode: 'only-on-failure' }
    );

    assert.deepEqual(nextResult.stdout, []);
    assert.deepEqual(nextResult.stderr, []);
    assert.deepEqual(nextResult.steps, [{ title: 'step' }]);
    assert.deepEqual(nextResult.attachments, []);
    assert.deepEqual(trimmedCounts, { output: 1, heavyArtifacts: 1 });
  });

  it('keeps failed test artifacts when only-on-failure mode is used', () => {
    const originalResult = {
      status: 'failed',
      stdout: [{ text: 'fail out' }],
      stderr: [{ text: 'fail err' }],
      steps: [{ title: 'step' }],
      attachments: [{ name: 'trace' }],
    };
    const { nextResult, trimmedCounts } = odhinAdaptiveTest.trimResult(originalResult, {
      lightweight: true,
      testOutputMode: 'only-on-failure',
    });

    assert.deepEqual(nextResult, originalResult);
    assert.deepEqual(trimmedCounts, { output: 0, heavyArtifacts: 0 });
  });

  it('times out stalled runtime hook promises', async () => {
    const stalledPromise = new Promise<never>(() => undefined);

    await assert.rejects(
      () => odhinAdaptiveTest.withTimeout(stalledPromise, 10),
      (error: unknown) => Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ODHIN_TIMEOUT')
    );
  });
});

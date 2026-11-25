import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import OdhinAdaptiveReporter from '../common/reporters/odhin-adaptive.reporter.cjs';

test.describe('Odhín adaptive reporter', () => {
  test('rejects custom evidence inside its replaced output folder before deleting files, including symlink aliases', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-evidence-containment-'));
    const output = path.join(root, 'report');
    const evidence = path.join(output, 'custom-evidence');
    const alias = path.join(root, 'alias');
    const previous = process.env.PW_A11Y_EVIDENCE_DIR;
    fs.mkdirSync(evidence, { recursive: true });
    fs.symlinkSync(output, alias);
    fs.writeFileSync(path.join(evidence, 'sentinel.txt'), 'preserve');
    try {
      for (const candidate of [evidence, path.join(alias, 'custom-evidence'), root]) {
        process.env.PW_A11Y_EVIDENCE_DIR = candidate;
        expect(() => new OdhinAdaptiveReporter({ outputFolder: output })).toThrow('must not contain one another');
        expect(fs.readFileSync(path.join(evidence, 'sentinel.txt'), 'utf8')).toBe('preserve');
      }
    } finally {
      if (previous === undefined) {
        delete process.env.PW_A11Y_EVIDENCE_DIR;
      } else {
        process.env.PW_A11Y_EVIDENCE_DIR = previous;
      }
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
  test('rejects reuse of a non-empty external accessibility directory before a run', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-evidence-runs-'));
    const external = path.join(root, 'external');
    fs.mkdirSync(external);
    const previous = process.env.PW_A11Y_EVIDENCE_DIR;
    process.env.PW_A11Y_EVIDENCE_DIR = external;
    try {
      const reporter = () => new OdhinAdaptiveReporter({ outputFolder: path.join(root, 'report'), createInnerReporter: () => ({}) });
      await expect(reporter().onBegin({ workers: 1 }, {})).resolves.toBeUndefined();
      fs.writeFileSync(path.join(external, 'manifest-entry-old.json'), '{}');
      await expect(reporter().onBegin({ workers: 1 }, {})).rejects.toThrow('empty directory');
      expect(fs.existsSync(path.join(external, 'manifest-entry-old.json'))).toBe(true);
    } finally {
      if (previous === undefined) {
        delete process.env.PW_A11Y_EVIDENCE_DIR;
      } else {
        process.env.PW_A11Y_EVIDENCE_DIR = previous;
      }
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('only allows one reporter to claim a shared external evidence directory', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-evidence-race-'));
    const previous = process.env.PW_A11Y_EVIDENCE_DIR;
    process.env.PW_A11Y_EVIDENCE_DIR = path.join(root, 'external');
    try {
      const reporter = () => new OdhinAdaptiveReporter({ outputFolder: path.join(root, 'report'), createInnerReporter: () => ({}) });
      const results = await Promise.allSettled([reporter().onBegin({ workers: 1 }, {}), reporter().onBegin({ workers: 1 }, {})]);
      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
      expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    } finally {
      if (previous === undefined) {
        delete process.env.PW_A11Y_EVIDENCE_DIR;
      } else {
        process.env.PW_A11Y_EVIDENCE_DIR = previous;
      }
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
  test('includes an expected failure in feature totals when retries are configured', () => {
    const reporter = new OdhinAdaptiveReporter({ createInnerReporter: () => ({}) });
    reporter.recordFeatureStat({ location: { file: '/repo/playwright_tests/e2e/login.test.ts' }, retries: 2, expectedStatus: 'failed' }, { status: 'failed', retry: 0, duration: 1 });
    expect(reporter.featureStats.get('login.test')).toEqual(expect.objectContaining({ totalTests: 1, passed: 1, failed: 0 }));
  });

  test('reports an unexpected pass of a test marked to fail as a failure after its retries', async () => {
    const results: Array<{ status: string }> = [];
    const reporter = new OdhinAdaptiveReporter({ createInnerReporter: () => ({ onTestEnd: (_test: unknown, result: { status: string }) => {
      results.push(result);
    } }) });
    const testCase = { id: 'expected-failure', location: { file: '/repo/playwright_tests/e2e/login.test.ts' }, retries: 1, expectedStatus: 'failed' };
    await reporter.onTestEnd(testCase, { status: 'passed', retry: 0, duration: 1 });
    expect(reporter.featureStats.size).toBe(0);
    await reporter.onTestEnd(testCase, { status: 'passed', retry: 1, duration: 1 });
    await reporter.flushInnerCallbacks();
    expect(reporter.featureStats.get('login.test')).toEqual(expect.objectContaining({ totalTests: 1, failed: 1 }));
    expect(results.map((result) => result.status)).toEqual(['failed', 'failed']);
  });
  test('records actual Playwright worker count and test metadata', async () => {
    let received: Record<string, any> = {};
    const reporter = new OdhinAdaptiveReporter({
      testEnvironment: 'aat | ci', appendRuntimeWorkers: true,
      createInnerReporter: (options: Record<string, unknown>) => {
        received = options;
        return { onBegin: () => undefined, onTestEnd: () => undefined };
      }
    });
    await reporter.onBegin({ workers: 3 }, {});
    await reporter.onTestEnd({ id: 'case', location: { file: '/repo/playwright_tests/e2e/approval.test.ts' }, tags: ['@smoke'] }, { status: 'passed', retry: 0, duration: 42 });
    expect(received.testEnvironment).toBe('aat | ci | workers=3');
    expect(reporter.testMetadata).toEqual([{ target: '#case-0', feature: 'approval.test', tags: ['@smoke'], durationMs: 42, retry: 0 }]);
  });
  test('keeps attachments external by default while allowing an explicit local override', () => {
    const receivedOptions: Record<string, unknown>[] = [];
    const createInnerReporter = (options: Record<string, unknown>) => {
      receivedOptions.push(options);
      return {};
    };

    new OdhinAdaptiveReporter({ createInnerReporter });
    new OdhinAdaptiveReporter({ embedAttachments: true, createInnerReporter });

    expect(receivedOptions).toHaveLength(2);
    expect(receivedOptions[0].embedAttachments).toBe(false);
    expect(receivedOptions[1].embedAttachments).toBe(true);
  });

  test('adds a reportable source to authentication failures', () => {
    const result = OdhinAdaptiveReporter.__test__.addFailureSource(
      { title: 'loads the organisation approvals page' },
      {
        status: 'failed',
        errors: [{ message: 'SessionCaptureError: IDAM login surface did not render', stack: 'at captureSession' }]
      }
    );

    expect(result.errors[0].message).toContain('[Failure source: XUI/IDAM authentication session capture]');
    expect(result.errors[0].stack).toContain('[Failure source: XUI/IDAM authentication session capture]');
  });

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

  test('forwards test output callbacks so failed-run evidence remains available', async () => {
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
    await reporter.onEnd({ status: 'passed' });

    expect(stdoutCalls).toBe(1);
    expect(stderrCalls).toBe(1);
  });

  test('continues report enhancement after a stalled finalizer', async () => {
    const reporter = new OdhinAdaptiveReporter({ outputFolder: 'missing-odhin-output' });
    reporter.statusCounts.passed = 1;
    reporter.finalizationTimeoutMs = 10;
    reporter.inner = { onEnd: () => new Promise(() => undefined) };

    await expect(reporter.onEnd({})).resolves.toBeUndefined();
  });

  test('sets a strict failure for runtime hook failures and timeouts', async () => {
    const originalExitCode = process.exitCode;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odhin-report-'));
    const reportFile = path.join(tempDir, 'playwright-odhin.html');
    fs.writeFileSync(reportFile, '<html><body>report</body></html>');
    process.exitCode = undefined;

    try {
      for (const invoke of [
        () => {
          throw new Error('runtime hook failed');
        },
        () => new Promise(() => undefined)
      ]) {
        process.exitCode = undefined;
        const reporter = new OdhinAdaptiveReporter({
          outputFolder: tempDir,
          profile: false,
          strictReportValidity: true,
          createInnerReporter: () => ({ onTestEnd: invoke, onEnd: () => Promise.resolve() })
        });
        reporter.runtimeHookTimeoutMs = 10;

        await reporter.onTestEnd({}, { status: 'passed', retry: 0, duration: 0 });
        await reporter.onEnd({ status: 'passed' });

        expect(process.exitCode).toBe(1);
      }
    } finally {
      process.exitCode = originalExitCode;
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('retains timed-out evidence in only-on-failure mode', () => {
    const result = {
      status: 'timedOut',
      stdout: [{ text: 'timeout output' }],
      stderr: [{ text: 'timeout error' }],
      steps: [{ title: 'timeout step' }],
      attachments: [{ name: 'trace.zip' }]
    };

    expect(OdhinAdaptiveReporter.__test__.trimResult(result, {
      lightweight: true,
      testOutputMode: 'only-on-failure'
    })).toEqual({ nextResult: result, trimmedCounts: { output: 0, heavyArtifacts: 0 } });
  });

  test('sets a failure for strict report finalization errors', async () => {
    const originalExitCode = process.exitCode;
    process.exitCode = undefined;

    try {
      const reporter = new OdhinAdaptiveReporter({
        profile: false,
        strictReportValidity: true,
        createInnerReporter: () => ({
          onEnd: () => {
            throw new Error('finalization failed');
          }
        })
      });

      await reporter.onEnd({ status: 'passed' });

      expect(process.exitCode).toBe(1);
    } finally {
      process.exitCode = originalExitCode;
    }
  });

  test('continues non-strict report finalization without setting failure', async () => {
    const originalExitCode = process.exitCode;
    process.exitCode = undefined;

    try {
      const reporter = new OdhinAdaptiveReporter({
        profile: false,
        strictReportValidity: false,
        createInnerReporter: () => ({
          onEnd: () => {
            throw new Error('report-only finalization failure');
          }
        })
      });

      await reporter.onEnd({ status: 'passed' });

      expect(process.exitCode).toBeUndefined();
    } finally {
      process.exitCode = originalExitCode;
    }
  });

  test('sets a failure for strict report enhancement errors', async () => {
    const originalExitCode = process.exitCode;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odhin-report-'));
    const invalidReportFolder = path.join(tempDir, 'report-file');
    fs.writeFileSync(invalidReportFolder, 'not a directory');
    process.exitCode = undefined;

    try {
      const reporter = new OdhinAdaptiveReporter({
        outputFolder: invalidReportFolder,
        profile: false,
        strictReportValidity: true,
        createInnerReporter: () => ({})
      });

      await reporter.onEnd({ status: 'passed' });

      expect(process.exitCode).toBe(1);
    } finally {
      process.exitCode = originalExitCode;
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('sets a failure for strict missing or empty report output', async () => {
    const originalExitCode = process.exitCode;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odhin-report-'));
    process.exitCode = undefined;

    try {
      for (const outputFolder of [path.join(tempDir, 'missing'), tempDir]) {
        process.exitCode = undefined;
        const reporter = new OdhinAdaptiveReporter({
          outputFolder,
          profile: false,
          strictReportValidity: true,
          createInnerReporter: () => ({})
        });

        await reporter.onEnd({ status: 'passed' });

        expect(process.exitCode).toBe(1);
      }
    } finally {
      process.exitCode = originalExitCode;
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

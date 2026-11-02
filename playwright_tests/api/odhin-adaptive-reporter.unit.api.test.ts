import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import OdhinAdaptiveReporter from '../common/reporters/odhin-adaptive.reporter.cjs';

test.describe('Odhín adaptive reporter', () => {
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

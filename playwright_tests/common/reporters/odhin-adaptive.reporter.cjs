/* global clearTimeout, process, require, module, setTimeout */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const odhinModule = require('odhin-reports-playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { enhanceGeneratedReport } = require('./odhin-report-enhancer.cjs');

const OdhinReporter = odhinModule.default ?? odhinModule;

class OdhinAdaptiveReporter {
  constructor(options = {}) {
    this.options = options;
    this.lightweight = resolveBoolean(process.env.PW_ODHIN_LIGHTWEIGHT, !process.env.CI);
    this.testOutputMode = normalizeTestOutputMode(options.testOutput ?? 'only-on-failure');
    this.runtimeHookTimeoutMs = normalizeTimeout(process.env.PW_ODHIN_RUNTIME_HOOK_TIMEOUT_MS, process.env.CI ? 0 : 15000);
    this.finalizationTimeoutMs = normalizeTimeout(process.env.PW_ODHIN_FINALIZATION_TIMEOUT_MS, 30000);
    this.trimFailedArtifacts = resolveBoolean(process.env.PW_ODHIN_TRIM_FAILED_ARTIFACTS, false);
    this.pendingInnerCallbacks = Promise.resolve();
    this.statusCounts = {
      passed: 0,
      failed: 0,
      skipped: 0,
      timedOut: 0,
      interrupted: 0,
      other: 0
    };
    this.inner = new OdhinReporter(options);
  }

  async onBegin(config, suite) {
    if (typeof this.inner.onBegin === 'function') {
      await this.inner.onBegin(config, suite);
    }
  }

  async onTestEnd(test, result) {
    if (typeof this.inner.onTestEnd !== 'function') {
      return;
    }

    const passedOrSkipped = result?.status === 'passed' || result?.status === 'skipped';
    const shouldTrimHeavyArtifacts = this.lightweight && (passedOrSkipped || (this.trimFailedArtifacts && !passedOrSkipped));
    const shouldDropTestOutput = this.testOutputMode === false || (this.testOutputMode === 'only-on-failure' && passedOrSkipped);
    let nextResult = result;

    if (shouldTrimHeavyArtifacts || shouldDropTestOutput) {
      nextResult = { ...result };
      if (shouldDropTestOutput) {
        nextResult.stdout = [];
        nextResult.stderr = [];
      }
      if (shouldTrimHeavyArtifacts) {
        nextResult.steps = [];
        nextResult.attachments = [];
      }
    }

    this.recordStatus(result?.status);
    this.enqueueInnerCallback('onTestEnd', () => this.inner.onTestEnd(test, nextResult), { test });
  }

  async onStdOut(chunk, test, result) {
    if (typeof this.inner.onStdOut === 'function') {
      this.enqueueInnerCallback('onStdOut', () => this.inner.onStdOut(chunk, test, result), { test });
    }
  }

  async onStdErr(chunk, test, result) {
    if (typeof this.inner.onStdErr === 'function') {
      this.enqueueInnerCallback('onStdErr', () => this.inner.onStdErr(chunk, test, result), { test });
    }
  }

  async onEnd(result) {
    process.stdout.write(`[odhin-profile] Finalizing Odhin report statusCounts=${JSON.stringify(this.statusCounts)}\n`);
    await this.pendingInnerCallbacks;

    if (typeof this.inner.onEnd === 'function') {
      try {
        await withTimeout(this.inner.onEnd(result), this.finalizationTimeoutMs);
      } catch (error) {
        process.stderr.write(`[odhin-profile] onEnd failed: ${formatErrorMessage(error)}\n`);
      }
    }

    try {
      enhanceGeneratedReport(this.options.outputFolder, []);
    } catch (error) {
      process.stderr.write(`[odhin-profile] report enhancement failed: ${formatErrorMessage(error)}\n`);
    }
  }

  recordStatus(status) {
    switch (status) {
      case 'passed':
        this.statusCounts.passed += 1;
        break;
      case 'failed':
        this.statusCounts.failed += 1;
        break;
      case 'skipped':
        this.statusCounts.skipped += 1;
        break;
      case 'timedOut':
        this.statusCounts.timedOut += 1;
        break;
      case 'interrupted':
        this.statusCounts.interrupted += 1;
        break;
      default:
        this.statusCounts.other += 1;
    }
  }

  enqueueInnerCallback(hookName, invoke, context = {}) {
    const run = async () => {
      try {
        await withTimeout(Promise.resolve().then(invoke), this.runtimeHookTimeoutMs);
      } catch (error) {
        process.stderr.write(`[odhin-profile] ${hookName} failed${formatHookContext(context)}: ${formatErrorMessage(error)}\n`);
      }
    };
    this.pendingInnerCallbacks = this.pendingInnerCallbacks.then(run, run);
    return this.pendingInnerCallbacks;
  }
}

function normalizeTestOutputMode(raw) {
  if (raw === true || raw === false) {
    return raw;
  }
  const normalized = String(raw ?? 'only-on-failure').trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  return 'only-on-failure';
}

function normalizeTimeout(raw, fallbackMs) {
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallbackMs;
}

function resolveBoolean(raw, fallback) {
  if (typeof raw === 'boolean') {
    return raw;
  }
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  return fallback;
}

async function withTimeout(promise, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
        timer.unref?.();
      })
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function formatErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function formatHookContext({ test } = {}) {
  const title =
    typeof test?.titlePath === 'function' ? test.titlePath().join(' > ') : typeof test?.title === 'string' ? test.title : '';
  return title ? ` test="${title}"` : '';
}

module.exports = OdhinAdaptiveReporter;

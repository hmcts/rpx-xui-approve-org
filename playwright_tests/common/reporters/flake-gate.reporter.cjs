/* global module, process */

class FlakeGateReporter {
  constructor() {
    this.totalAttempts = 0;
    this.finalOutcomesByTest = new Map();
    this.maxFlakyTests = Number.isFinite(Number(process.env.PW_MAX_FLAKY_TESTS)) ? Number(process.env.PW_MAX_FLAKY_TESTS) : 20;
    this.maxFlakyRate = Number.isFinite(Number(process.env.PW_MAX_FLAKY_RATE)) ? Number(process.env.PW_MAX_FLAKY_RATE) : 0.2;
  }

  projectName(test) {
    try {
      return test?.parent?.project?.()?.name || 'default-project';
    } catch {
      return 'default-project';
    }
  }

  testKey(test) {
    if (typeof test?.id === 'string' && test.id) {
      return `id:${test.id}`;
    }
    const project = this.projectName(test);
    const location = test?.location || {};
    const title = typeof test?.titlePath === 'function' ? test.titlePath().join(' > ') : test?.title || 'unknown-test';
    return `${project}:${location.file || 'unknown-file'}:${location.line || 0}:${location.column || 0}:${title}`;
  }

  onTestEnd(test, result) {
    if (result.status === 'skipped') {
      return;
    }
    this.totalAttempts += 1;
    const key = this.testKey(test);
    const current = this.finalOutcomesByTest.get(key);
    if (!current || result.retry >= current.retry) {
      this.finalOutcomesByTest.set(key, {
        retry: result.retry,
        status: result.status,
        outcome: typeof test.outcome === 'function' ? test.outcome() : ''
      });
    }
  }

  onEnd() {
    const outcomes = Array.from(this.finalOutcomesByTest.values());
    const flaky = outcomes.filter((item) => item.outcome === 'flaky' || (item.status === 'passed' && item.retry > 0)).length;
    const retriedPasses = outcomes.filter((item) => item.status === 'passed' && item.retry > 0).length;
    const failed = outcomes.filter((item) => ['failed', 'timedOut', 'interrupted'].includes(item.status)).length;
    const rate = flaky / (outcomes.length || 1);
    process.stdout.write([
      `[flake-gate] finished=${outcomes.length}`,
      `[flake-gate] attempts=${this.totalAttempts}`,
      `[flake-gate] flaky=${flaky}`,
      `[flake-gate] passed-on-retry=${retriedPasses}`,
      `[flake-gate] failed=${failed}`,
      `[flake-gate] flaky-rate=${(rate * 100).toFixed(2)}%`,
      `[flake-gate] thresholds: maxFlakyTests=${this.maxFlakyTests}, maxFlakyRate=${(this.maxFlakyRate * 100).toFixed(2)}%`,
      '[flake-gate] mode=report-only'
    ].join('\n') + '\n');
  }
}

module.exports = FlakeGateReporter;

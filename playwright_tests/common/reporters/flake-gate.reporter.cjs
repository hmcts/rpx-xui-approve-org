/* global module, process */

class FlakeSummaryReporter {
  constructor() {
    this.totalAttempts = 0;
    this.finalOutcomesByTest = new Map();
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
      `[flake-summary] finished=${outcomes.length}`,
      `[flake-summary] attempts=${this.totalAttempts}`,
      `[flake-summary] flaky=${flaky}`,
      `[flake-summary] passed-on-retry=${retriedPasses}`,
      `[flake-summary] failed=${failed}`,
      `[flake-summary] flaky-rate=${(rate * 100).toFixed(2)}%`,
      '[flake-summary] mode=report-only'
    ].join('\n') + '\n');
  }
}

module.exports = FlakeSummaryReporter;

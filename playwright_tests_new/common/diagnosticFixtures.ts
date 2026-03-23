import { test as base } from '@playwright/test';
import { attachAuthRecoveryAnnotations, consumeAuthRecoveryEvents, mergeAuthRecoveryEvents } from './authRecovery';
import { createFailureDiagnosticsTracker } from './failureDiagnostics';
import { readSessionRecoveryEvents } from './sessionCapture';

type DiagnosticFixtures = {
  _failureDiagnostics: void;
};

export const test = base.extend<DiagnosticFixtures>({
  _failureDiagnostics: [
    async ({ page }, use, testInfo) => {
      const tracker = createFailureDiagnosticsTracker(page);

      try {
        await use();
      } finally {
        tracker.detach();
        const authRecoveryEvents = mergeAuthRecoveryEvents(readSessionRecoveryEvents(), consumeAuthRecoveryEvents(page));
        attachAuthRecoveryAnnotations(testInfo, authRecoveryEvents, 'session/page');
        await tracker.attachIfFailed(testInfo);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

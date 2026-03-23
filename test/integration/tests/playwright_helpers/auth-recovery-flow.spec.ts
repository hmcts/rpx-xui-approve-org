import { strict as assert } from 'node:assert';

import { recoverCallbackError, recoverServerError } from '../../../../playwright_tests_new/common/authRecoveryFlow';

function createDriver(errorSequence: boolean[]) {
  const calls: string[] = [];
  let checkIndex = 0;

  return {
    calls,
    driver: {
      isErrorPage: async () => {
        const value = errorSequence[Math.min(checkIndex, errorSequence.length - 1)] ?? false;
        checkIndex += 1;
        return value;
      },
      reload: async () => {
        calls.push('reload');
      },
      waitFor: async (ms: number) => {
        calls.push(`wait:${ms}`);
      },
      gotoRoot: async () => {
        calls.push('gotoRoot');
      },
      reopenRoot: async () => {
        calls.push('reopenRoot');
      }
    }
  };
}

describe('authRecoveryFlow', () => {
  it('stops after an immediate refresh clears the error page', async () => {
    const { driver, calls } = createDriver([true, false]);

    await recoverServerError(
      driver,
      {
        immediateRefreshAttempts: 3,
        shortWaitMs: 500
      },
      {
        onImmediateRefresh: async (attempt) => {
          calls.push(`hook:immediate:${attempt}`);
        }
      }
    );

    assert.deepEqual(calls, ['hook:immediate:1', 'reload', 'wait:250']);
  });

  it('escalates through reload, gotoRoot, and reopenRoot when the error persists', async () => {
    const { driver, calls } = createDriver([true, true, true, true, true, true]);

    await recoverServerError(
      driver,
      {
        immediateRefreshAttempts: 2,
        shortWaitMs: 500
      },
      {
        onImmediateRefresh: async (attempt) => {
          calls.push(`hook:immediate:${attempt}`);
        },
        onReload: async () => {
          calls.push('hook:reload');
        },
        onGotoRoot: async () => {
          calls.push('hook:gotoRoot');
        },
        onReopenRoot: async () => {
          calls.push('hook:reopenRoot');
        }
      }
    );

    assert.deepEqual(calls, [
      'hook:immediate:1',
      'reload',
      'wait:250',
      'hook:immediate:2',
      'reload',
      'wait:250',
      'hook:reload',
      'reload',
      'wait:500',
      'hook:gotoRoot',
      'gotoRoot',
      'wait:500',
      'hook:reopenRoot',
      'reopenRoot'
    ]);
  });

  it('recovers callback errors by reopening AO root and waiting for the auth loop', async () => {
    const calls: string[] = [];

    await recoverCallbackError(
      {
        gotoRoot: async () => {
          calls.push('gotoRoot');
        },
        waitFor: async (ms: number) => {
          calls.push(`wait:${ms}`);
        }
      },
      500,
      {
        onGotoRoot: async () => {
          calls.push('hook:gotoRoot');
        }
      }
    );

    assert.deepEqual(calls, ['hook:gotoRoot', 'gotoRoot', 'wait:500']);
  });
});

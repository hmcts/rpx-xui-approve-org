import { strict as assert } from 'node:assert';

import { __test__ as authFlowTest } from '../../../../playwright_tests_new/common/authFlow';

describe('authFlow', () => {
  it('returns login-visible immediately for allow-login mode', () => {
    const action = authFlowTest.getAuthLoopAction('allow-login', 'login-visible', authFlowTest.createInitialAuthLoopCounters());

    assert.deepEqual(action, {
      kind: 'return',
      state: 'login-visible',
    });
  });

  it('treats login-visible as unresolved when sign-in is required', () => {
    const action = authFlowTest.getAuthLoopAction(
      'require-signed-in',
      'login-visible',
      authFlowTest.createInitialAuthLoopCounters()
    );

    assert.deepEqual(action, {
      kind: 'return',
      state: 'timed-out',
    });
  });

  it('requests a callback refresh while budget remains', () => {
    const action = authFlowTest.getAuthLoopAction(
      'allow-login',
      'callback-server-error',
      authFlowTest.createInitialAuthLoopCounters()
    );

    assert.deepEqual(action, {
      kind: 'refresh',
      reason: 'callback',
      counters: {
        callbackRefreshCount: 1,
        serverErrorRefreshCount: 0,
      },
    });
  });

  it('times out once callback refresh budget is exhausted', () => {
    const action = authFlowTest.getAuthLoopAction('allow-login', 'callback-server-error', {
      callbackRefreshCount: 3,
      serverErrorRefreshCount: 0,
    });

    assert.deepEqual(action, {
      kind: 'timed-out',
    });
  });

  it('requests a generic server-error refresh while budget remains', () => {
    const action = authFlowTest.getAuthLoopAction('allow-login', 'server-error', authFlowTest.createInitialAuthLoopCounters());

    assert.deepEqual(action, {
      kind: 'refresh',
      reason: 'server-error',
      counters: {
        callbackRefreshCount: 0,
        serverErrorRefreshCount: 1,
      },
    });
  });

  it('returns wait for pending states without changing counters', () => {
    const counters = authFlowTest.createInitialAuthLoopCounters();
    const action = authFlowTest.getAuthLoopAction('allow-login', 'pending', counters);

    assert.deepEqual(action, {
      kind: 'wait',
    });
    assert.deepEqual(counters, {
      callbackRefreshCount: 0,
      serverErrorRefreshCount: 0,
    });
  });
});

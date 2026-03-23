export const LOGIN_TIMEOUT_MS = 30_000;
export const CALLBACK_REFRESH_LIMIT = 3;
export const SERVER_ERROR_REFRESH_LIMIT = 8;
export const LOGIN_ATTEMPT_LIMIT = 3;
export const AUTH_POLL_INTERVAL_MS = 500;

export type AuthState = 'signed-in' | 'login-visible' | 'timed-out';
export type AuthObservedState = 'signed-in' | 'login-visible' | 'callback-server-error' | 'server-error' | 'pending';
export type AuthLoopMode = 'allow-login' | 'require-signed-in';
export type AuthLoopCounters = {
  callbackRefreshCount: number;
  serverErrorRefreshCount: number;
};
type AuthRefreshReason = 'callback' | 'server-error';

export type AuthLoopAction =
  | { kind: 'return'; state: AuthState }
  | { kind: 'refresh'; reason: AuthRefreshReason; counters: AuthLoopCounters }
  | { kind: 'wait' }
  | { kind: 'timed-out' };

export function createInitialAuthLoopCounters(): AuthLoopCounters {
  return {
    callbackRefreshCount: 0,
    serverErrorRefreshCount: 0
  };
}

export function getAuthLoopAction(
  mode: AuthLoopMode,
  observedState: AuthObservedState,
  counters: AuthLoopCounters
): AuthLoopAction {
  switch (observedState) {
    case 'signed-in':
      return { kind: 'return', state: 'signed-in' };
    case 'login-visible':
      return {
        kind: 'return',
        state: mode === 'allow-login' ? 'login-visible' : 'timed-out'
      };
    case 'callback-server-error':
      if (counters.callbackRefreshCount >= CALLBACK_REFRESH_LIMIT) {
        return { kind: 'timed-out' };
      }
      return {
        kind: 'refresh',
        reason: 'callback',
        counters: {
          ...counters,
          callbackRefreshCount: counters.callbackRefreshCount + 1
        }
      };
    case 'server-error':
      if (counters.serverErrorRefreshCount >= SERVER_ERROR_REFRESH_LIMIT) {
        return { kind: 'timed-out' };
      }
      return {
        kind: 'refresh',
        reason: 'server-error',
        counters: {
          ...counters,
          serverErrorRefreshCount: counters.serverErrorRefreshCount + 1
        }
      };
    default:
      return { kind: 'wait' };
  }
}

export const __test__ = {
  createInitialAuthLoopCounters,
  getAuthLoopAction
};

import type { FullConfig } from '@playwright/test';
import { sessionCapture, type SessionCaptureOptions, type SessionIdentityInput } from './sessionCapture';

export type SessionSuite = 'api' | 'e2e' | 'integration' | 'nightly';

export type SessionWarmupRequest = {
  user: SessionIdentityInput;
  options?: SessionCaptureOptions;
};

const SESSION_WARMUP_REQUESTS: Record<SessionSuite, readonly SessionWarmupRequest[]> = {
  api: [{ user: 'api', options: { partitionKey: 'api' } }],
  e2e: [{ user: 'base' }],
  integration: [{ user: 'base' }],
  nightly: [{ user: 'base' }]
};

export function resolveSessionWarmupRequests(suite: SessionSuite): readonly SessionWarmupRequest[] {
  return SESSION_WARMUP_REQUESTS[suite];
}

export async function warmUpSessions(suite: SessionSuite): Promise<void> {
  if ((process.env.PW_SKIP_SESSION_CAPTURE ?? '').toLowerCase() === 'true') {
    console.log(`[playwright-session] Session warm-up skipped for ${suite}`);
    return;
  }

  const requests = resolveSessionWarmupRequests(suite);
  console.log(`[playwright-session] Warming ${requests.length} ${suite} session(s)`);
  await Promise.all(requests.map(({ user, options }) => sessionCapture(user, options)));
}

export function createSessionWarmupGlobalSetup(suite: SessionSuite): (fullConfig: FullConfig) => Promise<void> {
  return async (_fullConfig: FullConfig): Promise<void> => {
    void _fullConfig;
    await warmUpSessions(suite);
  };
}

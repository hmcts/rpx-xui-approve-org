import type { Page, TestInfo } from '@playwright/test';

export type AuthRecoveryEvent = {
  kind: 'ao-server-error' | 'callback-server-error' | 'cookie-banner' | 'login-retry';
  context: string;
  url: string;
  detail?: string;
  timestamp: string;
};

const authRecoveryEvents = new WeakMap<Page, AuthRecoveryEvent[]>();

function getPageEvents(page: Page): AuthRecoveryEvent[] {
  const existing = authRecoveryEvents.get(page);
  if (existing) {
    return existing;
  }

  const events: AuthRecoveryEvent[] = [];
  authRecoveryEvents.set(page, events);
  return events;
}

export function recordAuthRecoveryEvent(page: Page, event: Omit<AuthRecoveryEvent, 'timestamp'>) {
  getPageEvents(page).push({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

export function consumeAuthRecoveryEvents(page: Page): AuthRecoveryEvent[] {
  const events = [...getPageEvents(page)];
  authRecoveryEvents.delete(page);
  return events;
}

export function mergeAuthRecoveryEvents(...collections: AuthRecoveryEvent[][]): AuthRecoveryEvent[] {
  const seen = new Set<string>();
  const merged: AuthRecoveryEvent[] = [];

  for (const collection of collections) {
    for (const event of collection) {
      const key = [event.kind, event.context, event.url, event.detail ?? '', event.timestamp].join('|');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(event);
    }
  }

  return merged.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

export function summariseAuthRecoveryEvents(events: AuthRecoveryEvent[]): string {
  return events
    .slice(0, 6)
    .map((event) => `${event.kind} @ ${event.context} (${event.url}${event.detail ? `: ${event.detail}` : ''})`)
    .join(' | ')
    .slice(0, 800);
}

export function attachAuthRecoveryAnnotations(testInfo: TestInfo, events: AuthRecoveryEvent[], source: string) {
  if (events.length === 0) {
    return;
  }

  const summary = summariseAuthRecoveryEvents(events);
  const serverErrorCount = events.filter(
    (event) => event.kind === 'ao-server-error' || event.kind === 'callback-server-error'
  ).length;
  const loginRetryCount = events.filter((event) => event.kind === 'login-retry').length;

  testInfo.annotations.push({
    type: 'Recovered login issues',
    description: `${source}: ${summary}`,
  });

  if (serverErrorCount > 0) {
    testInfo.annotations.push({
      type: 'AO pod signals',
      description: `${source}: recovered from ${serverErrorCount} transient AO/auth server error event(s)`,
    });
  }

  if (loginRetryCount > 0) {
    testInfo.annotations.push({
      type: 'Login retries',
      description: `${source}: ${loginRetryCount} login retry event(s) were required before the journey recovered`,
    });
  }
}

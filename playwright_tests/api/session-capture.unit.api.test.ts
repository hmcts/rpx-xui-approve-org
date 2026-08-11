import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { __test__ as sessionCapture } from '../helpers/sessionCapture';

const validIdentity = {
  userIdentifier: 'base-alias',
  email: 'ao@example.test',
  password: 'do-not-log-this',
  sessionKey: 'shared-ao-account'
};

function writeStorageState(directory: string, cookies: unknown[]): string {
  const statePath = path.join(directory, 'state.json');
  fs.writeFileSync(statePath, JSON.stringify({ cookies, origins: [] }));
  return statePath;
}

test.describe('AO Playwright session management', () => {
  test('resolves aliases to the credential identity and keeps explicit partitions separate', () => {
    expect(sessionCapture.resolveSessionIdentity(validIdentity)).toEqual(validIdentity);
    expect(sessionCapture.resolveSessionPartitionKey()).toBeUndefined();
    expect(sessionCapture.resolveSessionPartitionKey(' api ')).toBe('api');
    expect(sessionCapture.normaliseSessionStorageKey('a user@example.test/api')).toBe('a-user-example.test-api');
  });

  test('rejects an auth cookie for another host and accepts a compatible unexpired cookie', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const statePath = writeStorageState(directory, [
      { name: 'Idam.Session', domain: 'other.example.test', expires: Math.floor(Date.now() / 1000) + 300 }
    ]);
    expect(sessionCapture.hasUnexpiredAuthCookie(statePath, 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(false);

    fs.writeFileSync(
      statePath,
      JSON.stringify({
        cookies: [{ name: 'Idam.Session', domain: '.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 }],
        origins: []
      })
    );
    expect(sessionCapture.hasUnexpiredAuthCookie(statePath, 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(true);
  });

  test('treats malformed, expired and valid state differently', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const statePath = writeStorageState(directory, [
      { name: 'Idam.Session', domain: '.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 }
    ]);
    expect(sessionCapture.isSessionFresh(statePath, 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(true);

    fs.writeFileSync(statePath, '{not-json');
    expect(sessionCapture.isSessionFresh(statePath)).toBe(false);
  });

  test('persists state atomically and leaves no temporary file after success', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const statePath = path.join(directory, 'state.json');
    const context = { storageState: async ({ path: outputPath }: { path: string }) => fs.writeFileSync(outputPath, '{"cookies":[]}') };

    await sessionCapture.persistSessionState(context as never, statePath);

    expect(fs.readFileSync(statePath, 'utf8')).toBe('{"cookies":[]}');
    expect(fs.readdirSync(directory)).toEqual(['state.json']);
  });

  test('redacts tokens and passwords from failure markers', () => {
    expect(sessionCapture.redactSensitiveText('https://example.test/callback?access_token=abc123&x=1 password=secret')).toBe(
      'https://example.test/callback?access_token=[REDACTED]&x=1 password=[REDACTED]'
    );
  });

  test('rejects wrong and unavailable routes before accepting an authenticated page', async () => {
    const locator = {
      isVisible: async () => false,
      first: () => locator,
      innerText: async () => 'Unexpected page'
    };
    const page = (url: string) => ({
      url: () => url,
      locator: () => locator,
      getByRole: () => locator,
      request: {
        get: async () => ({
          status: () => 200,
          text: async () => 'true'
        })
      }
    });

    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/other') as never, 'https://example.test/target')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/service-down') as never, 'https://example.test/service-down')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/access-denied') as never, 'https://example.test/')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://other.example.test/organisation') as never, 'https://example.test/organisation')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/organisation') as never, 'https://example.test/')).toBe(true);
  });

  test('waiters reuse the lock owner result and the stale budget exceeds login and auth polling', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const lockPath = path.join(directory, 'state.lock');
    const release = await sessionCapture.acquireSessionCaptureLock(lockPath);
    const waiting = sessionCapture.acquireSessionCaptureLock(lockPath);
    await new Promise((resolve) => setTimeout(resolve, 20));
    release();
    const waitingRelease = await waiting;
    waitingRelease();

    expect(sessionCapture.SESSION_CAPTURE_LOCK_TIMEOUT_MS).toBeGreaterThan(sessionCapture.SESSION_CAPTURE_LOCK_STALE_MS);
    expect(sessionCapture.SESSION_CAPTURE_LOCK_STALE_MS).toBeGreaterThan(45_000 + 30_000);
  });

  test('does not remove a lock replaced after the original owner became stale', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const lockPath = path.join(directory, 'state.lock');
    const originalRelease = await sessionCapture.acquireSessionCaptureLock(lockPath);

    const staleTimestamp = new Date(Date.now() - sessionCapture.SESSION_CAPTURE_LOCK_STALE_MS - 1);
    fs.utimesSync(lockPath, staleTimestamp, staleTimestamp);
    const replacementRelease = await sessionCapture.acquireSessionCaptureLock(lockPath);

    originalRelease();
    expect(fs.existsSync(lockPath)).toBe(true);

    replacementRelease();
    expect(fs.existsSync(lockPath)).toBe(false);
  });
});

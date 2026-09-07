import { expect, test } from '@playwright/test';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { config } from '../config/config';
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
    expect(sessionCapture.getSessionStatePath(validIdentity)).toBe(
      sessionCapture.getSessionStatePath({ ...validIdentity, userIdentifier: 'another-alias' })
    );
    expect(sessionCapture.getSessionStatePath(validIdentity, 'api')).not.toBe(sessionCapture.getSessionStatePath(validIdentity));
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

  test('accepts fresh-capture cookies only when both AO and IDAM sessions are valid for their hosts', () => {
    const validCookies = [
      { name: 'Idam.Session', value: 'redacted', domain: 'idam-web-public.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 },
      { name: 'ao-webapp', value: 'redacted', domain: 'administer-orgs.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 }
    ];

    expect(sessionCapture.hasPersistableSessionCookies(validCookies, 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(true);
    expect(sessionCapture.hasPersistableSessionCookies(validCookies.slice(1), 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(false);
    expect(sessionCapture.hasPersistableSessionCookies([
      validCookies[0],
      { ...validCookies[1], domain: 'other.example.test' }
    ], 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(false);
    expect(sessionCapture.hasPersistableSessionCookies([
      { ...validCookies[0], domain: 'untrusted-idam.example.test' },
      validCookies[1]
    ], 'https://administer-orgs.aat.platform.hmcts.net/')).toBe(false);
  });

  test('uses AO cookies only as a non-login fallback when the legacy auth probe is false', async () => {
    const aoSessionHost = new URL(config.baseUrl).hostname;
    const validCookies = [
      { name: 'Idam.Session', value: 'redacted', domain: 'idam-web-public.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 },
      { name: 'ao-webapp', value: 'redacted', domain: aoSessionHost, expires: Math.floor(Date.now() / 1000) + 300 }
    ];
    const hiddenLocator = {
      isVisible: async () => false,
      first: () => hiddenLocator
    };
    const page = (url: string, authenticated: boolean) => ({
      url: () => url,
      locator: () => hiddenLocator,
      getByRole: () => hiddenLocator,
      request: { get: async () => ({ status: () => 200, text: async () => String(authenticated) }) }
    });
    const context = (cookies: unknown[]) => ({ cookies: async () => cookies });

    await expect(sessionCapture.hasCapturedAuthenticatedSession(
      page('https://example.test/organisation', true) as never,
      context([]) as never,
      0
    )).resolves.toBe(true);
    await expect(sessionCapture.hasCapturedAuthenticatedSession(
      page('https://example.test/organisation', false) as never,
      context(validCookies) as never,
      0
    )).resolves.toBe(true);
    await expect(sessionCapture.hasCapturedAuthenticatedSession(
      page('https://example.test/organisation', false) as never,
      context([]) as never,
      0
    )).resolves.toBe(false);
    await expect(sessionCapture.hasCapturedAuthenticatedSession(
      page('https://idam.example.test/login', false) as never,
      context(validCookies) as never,
      0
    )).resolves.toBe(false);
  });

  test('keeps an authenticated progressive IDAM login when the legacy auth probe is false', async () => {
    const aoSessionHost = new URL(config.baseUrl).hostname;
    const validCookies = [
      { name: 'Idam.Session', value: 'redacted', domain: 'idam-web-public.aat.platform.hmcts.net', expires: Math.floor(Date.now() / 1000) + 300 },
      { name: 'ao-webapp', value: 'redacted', domain: aoSessionHost, expires: Math.floor(Date.now() / 1000) + 300 }
    ];
    let completedLogin = false;
    let clearedCookies = 0;
    const locator = {
      first: () => locator,
      isVisible: async () => !completedLogin
    };
    const page = {
      goto: async () => undefined,
      url: () => completedLogin ? `${config.baseUrl}organisation` : 'https://idam-web-public.aat.platform.hmcts.net/login',
      locator: () => locator,
      getByRole: () => locator,
      waitForLoadState: async () => undefined,
      title: async () => '',
      request: { get: async () => ({ status: () => 200, text: async () => 'false' }) },
      context: () => ({
        cookies: async () => validCookies,
        clearCookies: async () => {
          clearedCookies += 1;
          throw new Error('A valid AO session must not be cleared after IDAM login.');
        }
      })
    };

    await expect(sessionCapture.completeLoginOnPage(
      page as never,
      'user@example.test',
      'not-a-real-password',
      async () => { completedLogin = true; }
    )).resolves.toBeUndefined();

    expect(completedLogin).toBe(true);
    expect(clearedCookies).toBe(0);
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

  test('redacts OAuth and authentication details from session-capture diagnostics', async () => {
    const locator = {
      first: () => locator,
      isVisible: async () => false,
      innerText: async () => ''
    };
    const page = {
      url: () => 'https://example.test/oauth2/callback?access_token=abc123',
      title: async () => 'Login failed',
      locator: () => locator,
      request: {
        get: async () => ({
          status: () => 500,
          text: async () => 'password=secret'
        })
      }
    };

    await expect(sessionCapture.loginFailureContext(page as never)).resolves.toContain('access_token=[REDACTED]');
    await expect(sessionCapture.loginFailureContext(page as never)).resolves.toContain('password=[REDACTED]');
  });

  test('rejects wrong and unavailable routes before accepting an authenticated page', async () => {
    const locator = {
      isVisible: async () => false,
      first: () => locator,
      innerText: async () => 'Unexpected page'
    };
    const page = (url: string, visibleShell?: string, authenticated = true, signedInNavigation = authenticated) => ({
      url: () => url,
      locator: () => locator,
      getByRole: (role: string, options?: { name?: string | RegExp }) => ({
        ...locator,
        isVisible: async () => role === 'link' && options?.name === 'Sign out'
          ? signedInNavigation
          : typeof options?.name === 'string'
          ? options.name === visibleShell
          : options?.name?.test(visibleShell ?? '') ?? false
      }),
      request: {
        get: async () => ({
          status: () => 200,
          text: async () => String(authenticated)
        })
      }
    });

    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/other') as never, 'https://example.test/target')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/service-down') as never, 'https://example.test/service-down')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/access-denied') as never, 'https://example.test/')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://other.example.test/organisation') as never, 'https://example.test/organisation')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/organisation') as never, 'https://example.test/')).toBe(false);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/organisation', 'Organisation approvals') as never, 'https://example.test/')).toBe(true);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(
      page('https://example.test/organisation-details/ORG-123', 'Approve organisation') as never,
      'https://example.test/organisation-details/ORG-123'
    )).toBe(true);
    expect(await sessionCapture.isExpectedAuthenticatedSurface(page('https://example.test/caseworker-details', 'Upload staff details') as never, 'https://example.test/')).toBe(true);
  });

  test('accepts the signed-in AO shell when the legacy auth probe returns false', async () => {
    const locator = {
      first: () => locator,
      isVisible: async () => false,
      innerText: async () => 'Organisation details'
    };
    const page = (signedInNavigation: boolean) => ({
      url: () => 'https://example.test/organisation-details/ORG-123',
      locator: () => locator,
      getByRole: (role: string, options?: { name?: string | RegExp }) => ({
        ...locator,
        isVisible: async () => role === 'link' && options?.name === 'Sign out'
          ? signedInNavigation
          : options?.name === 'Organisation details'
      }),
      request: {
        get: async () => ({ status: () => 200, text: async () => 'false' })
      }
    });

    await expect(sessionCapture.isExpectedAuthenticatedSurface(
      page(true) as never,
      'https://example.test/organisation-details/ORG-123'
    )).resolves.toBe(true);
    await expect(sessionCapture.isExpectedAuthenticatedSurface(
      page(false) as never,
      'https://example.test/organisation-details/ORG-123'
    )).resolves.toBe(false);
  });

  test('uses the level-one organisation-details title instead of an ambiguous heading locator', async () => {
    const locator = {
      first: () => locator,
      isVisible: async () => true,
      innerText: async () => 'Organisation details'
    };
    const page = {
      getByRole: (_role: string, options?: { name?: string | RegExp }) => ({
        ...locator,
        isVisible: async () => options?.name === 'Organisation details'
      })
    };

    await expect(sessionCapture.hasExpectedAuthenticatedShell(
      page as never,
      '/organisation-details/ORG-123'
    )).resolves.toBe(true);
  });

  test('waits for AO bootstrap navigation before accepting the authenticated shell', async () => {
    let route = 'https://example.test/';
    let bodyText = '';
    const locator = {
      first: () => locator,
      isVisible: async () => false,
      innerText: async () => bodyText
    };
    const page = {
      url: () => route,
      locator: () => locator,
      getByRole: (_role: string, options?: { name?: string | RegExp }) => ({
        ...locator,
        isVisible: async () => options?.name === 'Organisation approvals'
      }),
      request: {
        get: async () => ({
          status: () => 200,
          text: async () => 'true'
        })
      },
      waitForTimeout: async () => {
        route = 'https://example.test/organisation';
        bodyText = 'Organisation approvals';
      }
    };

    await expect(sessionCapture.waitForExpectedAuthenticatedSurface(page as never, 'https://example.test/', 10)).resolves.toBe(true);
  });

  test('waiters reuse the lock owner result and the stale budget exceeds login and auth polling', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const lockPath = path.join(directory, 'state.lock');
    const request = {
      lockPath,
      userIdentifier: 'base',
      isSessionReusable: () => false
    };
    const release = await sessionCapture.acquireSessionCaptureLock(request);
    const waiting = sessionCapture.acquireSessionCaptureLock(request);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await release?.();
    const waitingRelease = await waiting;
    await waitingRelease?.();

    expect(sessionCapture.SESSION_CAPTURE_LOCK_TIMEOUT_MS).toBeGreaterThanOrEqual(
      sessionCapture.SESSION_CAPTURE_ATTEMPT_BUDGET_MS * sessionCapture.SESSION_CAPTURE_ATTEMPTS
    );
    expect(sessionCapture.SESSION_CAPTURE_LOCK_STALE_MS).toBeGreaterThan(sessionCapture.SESSION_CAPTURE_ATTEMPT_BUDGET_MS);
    expect(sessionCapture.SESSION_CAPTURE_LOCK_UPDATE_MS).toBeLessThan(sessionCapture.SESSION_CAPTURE_LOCK_STALE_MS);
  });

  test('stops waiting when another process creates a fresh reusable session', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const lockPath = path.join(directory, 'state.lock');
    const owner = await sessionCapture.acquireSessionCaptureLock({
      lockPath,
      userIdentifier: 'base',
      isSessionReusable: () => false
    });
    let reusable = false;
    const waiting = sessionCapture.acquireSessionCaptureLock({
      lockPath,
      userIdentifier: 'base',
      isSessionReusable: () => reusable
    });

    reusable = true;
    await expect(waiting).resolves.toBeNull();
    await owner?.();
  });

  test('reuses a replacement session when concurrent rejected-session recovery is forced', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-'));
    const statePath = writeStorageState(directory, [
      { name: 'ao-webapp', value: 'rejected', domain: new URL(config.baseUrl).hostname, expires: Math.floor(Date.now() / 1000) + 300 }
    ]);
    const lockPath = `${statePath}.lock`;
    const rejectedFingerprint = sessionCapture.readStorageStateFingerprint(statePath);
    if (!rejectedFingerprint) {
      throw new Error('Expected a fingerprint for the seeded rejected session.');
    }
    const recoveryOptions = {
      force: true,
      expectedStaleSession: {
        storageStatePath: statePath,
        storageStateFingerprint: rejectedFingerprint
      }
    };

    expect(sessionCapture.isReusableSessionForCapture(statePath, recoveryOptions)).toBe(false);
    const owner = await sessionCapture.acquireSessionCaptureLock({
      lockPath,
      userIdentifier: 'base',
      isSessionReusable: () => sessionCapture.isReusableSessionForCapture(statePath, recoveryOptions)
    });
    const waiting = sessionCapture.acquireSessionCaptureLock({
      lockPath,
      userIdentifier: 'base',
      isSessionReusable: () => sessionCapture.isReusableSessionForCapture(statePath, recoveryOptions)
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    writeStorageState(directory, [
      { name: 'ao-webapp', value: 'replacement', domain: new URL(config.baseUrl).hostname, expires: Math.floor(Date.now() / 1000) + 300 }
    ]);
    expect(sessionCapture.isReusableSessionForCapture(statePath, recoveryOptions)).toBe(true);
    await owner?.();

    await expect(waiting).resolves.toBeNull();
    expect(sessionCapture.isReusableSessionForCapture(statePath, { force: true })).toBe(false);
  });

  test('uses a bounded retry policy only for classified transient capture failures', () => {
    expect(sessionCapture.SESSION_CAPTURE_ATTEMPTS).toBe(2);
    expect(sessionCapture.isRetryableSessionCaptureFailure('net::ERR_CONNECTION_RESET')).toBe(true);
    expect(sessionCapture.isRetryableSessionCaptureFailure('Invalid credentials')).toBe(false);
  });

  test('allows exactly one owner across competing Node processes', async () => {
    test.setTimeout(15_000);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-process-'));
    const lockPath = path.join(directory, 'state.lock');
    const modulePath = path.resolve(__dirname, '../helpers/sessionCapture.ts');
    const childProgram = [
      "const { __test__ } = require(process.argv[1]);",
      '(async () => {',
      '  const release = await __test__.acquireSessionCaptureLock({',
      '    lockPath: process.argv[2], userIdentifier: process.argv[3], isSessionReusable: () => false',
      '  });',
      "  process.stdout.write(`acquired:${Date.now()}\\n`);",
      '  setTimeout(async () => {',
      '    await release();',
      "    process.stdout.write(`released:${Date.now()}\\n`);",
      '  }, Number(process.argv[4]));',
      '})().catch((error) => { console.error(error); process.exitCode = 1; });'
    ].join('\n');
    const startOwner = (holdMs: number) => spawn(
      process.execPath,
      ['-r', 'ts-node/register/transpile-only', '-e', childProgram, modulePath, lockPath, 'base', String(holdMs)],
      { cwd: path.resolve(__dirname, '../..'), env: process.env }
    );
    const readOutput = (child: ReturnType<typeof spawn>) => new Promise<string>((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      child.stdout.on('data', (chunk) => { output += chunk.toString(); });
      child.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });
      child.once('error', reject);
      child.once('close', (code) => {
        if (code === 0) {
          resolve(output);
          return;
        }
        reject(new Error(`Session lease child exited with ${code}: ${errorOutput}`));
      });
    });

    const first = startOwner(250);
    const firstAcquired = new Promise<void>((resolve) => first.stdout.once('data', () => resolve()));
    const firstOutput = readOutput(first);
    await firstAcquired;
    const secondOutput = readOutput(startOwner(0));
    const [owner, waiter] = await Promise.all([firstOutput, secondOutput]);
    const ownerReleasedAt = Number(owner.match(/released:(\d+)/)?.[1]);
    const waiterAcquiredAt = Number(waiter.match(/acquired:(\d+)/)?.[1]);

    expect(ownerReleasedAt).toBeGreaterThan(0);
    expect(waiterAcquiredAt).toBeGreaterThanOrEqual(ownerReleasedAt);
  });
});

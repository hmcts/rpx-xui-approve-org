import { test, expect, chromium } from '@playwright/test';
import * as sinon from 'sinon';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { __test__ as sessionCapture, sessionCaptureInProcess, getSessionStatePath } from '../helpers/sessionCapture';
import { config } from '../config/config';

test('an aged live owner cannot be replaced before releasing the lock', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-lock-fence-'));
  const lockPath = path.join(directory, 'state.lock');
  const first = await sessionCapture.acquireSessionCaptureLock({ lockPath, userIdentifier: 'one', isSessionReusable: () => false });
  try {
    const stale = new Date(Date.now() - 10 * 60_000);
    fs.utimesSync(`${lockPath}.lock`, stale, stale);
    let acquired = false;
    const waiting = sessionCapture.acquireSessionCaptureLock({ lockPath, userIdentifier: 'two', isSessionReusable: () => false }).then((lock) => {
      acquired = true;
      return lock;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(acquired).toBe(false);
    first!.assertOwned();
    await first!();
    const second = await waiting;
    expect(acquired).toBe(true);
    await second!();
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

test('ownership loss while writing a temporary state cannot overwrite a successor', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-lock-fence-'));
  const statePath = path.join(directory, 'state.json');
  const lockPath = `${statePath}.lock`;
  const first = await sessionCapture.acquireSessionCaptureLock({ lockPath, userIdentifier: 'one', isSessionReusable: () => false });
  let finishSnapshot: (() => void) | undefined;
  const snapshot = new Promise<void>((resolve) => {
    finishSnapshot = resolve;
  });
  const context = { storageState: async ({ path: temporaryPath }: { path: string }) => {
    await snapshot;
    fs.writeFileSync(temporaryPath, 'old owner');
  } };
  try {
    const pending = sessionCapture.persistSessionState(context as never, statePath, first!.assertOwned);
    fs.rmSync(`${lockPath}.lock`, { recursive: true });
    const second = await sessionCapture.acquireSessionCaptureLock({ lockPath, userIdentifier: 'two', isSessionReusable: () => false });
    fs.writeFileSync(statePath, 'successor');
    finishSnapshot!();
    await expect(pending).rejects.toThrow(/ownership/);
    await first!();
    second!.assertOwned();
    expect(fs.readFileSync(statePath, 'utf8')).toBe('successor');
    await second!();
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

for (const failure of [new Error('synthetic close failed'), undefined]) {
  test(`unconfirmed browser shutdown retains the session lock (${String(failure)})`, async () => {
    const identity = { userIdentifier: 'fake-close-failure', email: `fake-close-${Date.now()}@example.invalid`, password: 'synthetic' };
    const lockDirectory = `${getSessionStatePath(identity, 'api')}.lock.lock`;
    const controller = new AbortController();
    let finishContext: ((value: unknown) => void) | undefined;
    let contextStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      contextStarted = resolve;
    });
    const context = new Promise((resolve) => {
      finishContext = resolve;
    });
    const fakeBrowser = {
      newContext: async () => {
      contextStarted!();
      return context;
      },
      close: async () => {
        throw failure;
      }
    };
    const stub = sinon.stub(chromium, 'launch').resolves(fakeBrowser as never);
    try {
      const capture = sessionCaptureInProcess(identity, { force: true, partitionKey: 'api' }, controller.signal);
      await started;
      controller.abort();
    finishContext!({ newPage: async () => ({}) });
    await expect(capture).rejects.toThrow('Browser close failed; session capture lock retained.');
    expect(fs.existsSync(lockDirectory)).toBe(true);
    } finally {
      stub.restore();
      fs.rmSync(lockDirectory, { recursive: true, force: true });
    }
  });
}

test('child diagnostics never forward arbitrary credential text', () => {
  // The child entrypoint is intentionally CommonJS for Node fork.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { safeError, safeLog } = require('../helpers/session-capture-child.cjs');
  const secret = 'synthetic-password-should-not-appear';
  expect(safeError(new Error(`request failed ${secret}`))).not.toContain(secret);
  expect(safeLog([`Capturing session ${secret}`])).not.toContain(secret);
  expect(safeError(new Error('Authentication probe unavailable: HTTP 503.'))).toBe('Authentication probe unavailable: HTTP 503.');
  expect(safeError(new Error('Session capture did not create an authenticated session for secret'))).toBe('Session capture authentication was rejected.');
  expect(safeError(new Error(`net::ERR_CONNECTION_RESET ${secret}`))).toBe('A network error interrupted session capture.');
  expect(safeError(new Error(`Recent session capture failed for ${secret}`))).toBe('A recent session capture failed; waiting before retrying.');
});

test('actual capture process reports cooldown without exposing its stored detail', async () => {
  const identity = { userIdentifier: 'fake-cooldown', email: `fake-cooldown-${Date.now()}@example.invalid`, password: 'synthetic-password-secret' };
  const failurePath = `${getSessionStatePath(identity, 'api')}.capture-failed.json`;
  fs.mkdirSync(path.dirname(failurePath), { recursive: true });
  fs.writeFileSync(failurePath, JSON.stringify({ timestamp: Date.now(), message: 'synthetic-secret-detail', retryable: false }));
  try {
    const { sessionCapture: capture } = await import('../helpers/sessionCapture');
    const message = await capture(identity, { partitionKey: 'api' }).then(() => 'unexpected success', (error: Error) => error.message);
    expect(message).toBe('A recent session capture failed; waiting before retrying.');
  } finally {
    fs.rmSync(failurePath, { force: true });
  }
});

test('actual capture process reports unconfirmed browser shutdown without its raw error', async () => {
  const identity = { userIdentifier: 'fake-close-child', email: `fake-close-child-${Date.now()}@example.invalid`, password: 'synthetic-password-secret' };
  const lockDirectory = `${getSessionStatePath(identity, 'api')}.lock.lock`;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-child-close-'));
  const preload = path.join(directory, 'preload.cjs');
  const playwright = require.resolve('@playwright/test');
  fs.writeFileSync(preload, `const { chromium } = require(${JSON.stringify(playwright)}); chromium.launch = async () => ({ newContext: async () => { throw new Error('synthetic-secret-context'); }, close: async () => { throw new Error('synthetic-secret-close'); } });`);
  const previousOptions = process.env.NODE_OPTIONS;
  process.env.NODE_OPTIONS = `${previousOptions || ''} --require=${preload}`.trim();
  try {
    const { sessionCapture: capture } = await import('../helpers/sessionCapture');
    const message = await capture(identity, { force: true, partitionKey: 'api' }).then(() => 'unexpected success', (error: Error) => error.message);
    expect(message).toBe('Browser close failed; session capture lock retained.');
    expect(fs.existsSync(lockDirectory)).toBe(true);
  } finally {
    if (previousOptions === undefined) {
      delete process.env.NODE_OPTIONS;
    } else {
      process.env.NODE_OPTIONS = previousOptions;
    }
    fs.rmSync(lockDirectory, { force: true, recursive: true });
    fs.rmSync(`${getSessionStatePath(identity, 'api')}.capture-failed.json`, { force: true });
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

test('fresh sessions reuse locally while force and rejected fingerprints still require capture', async () => {
  const identity = { userIdentifier: 'fake-fast-path', email: `fake-fast-${Date.now()}@example.invalid`, password: 'synthetic' };
  const statePath = getSessionStatePath(identity, 'api');
  const failurePath = `${statePath}.capture-failed.json`;
  const previousOptions = process.env.NODE_OPTIONS;
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ cookies: [{ name: 'ao-webapp', value: 'synthetic', domain: new URL(config.baseUrl).hostname, expires: -1 }], origins: [] }));
  fs.writeFileSync(failurePath, JSON.stringify({ timestamp: Date.now(), message: 'old failure' }));
  process.env.NODE_OPTIONS = '--require=/nonexistent/synthetic-preload.cjs';
  const log = sinon.stub(console, 'log');
  try {
    const { sessionCapture: capture } = await import('../helpers/sessionCapture');
    await expect(capture(identity, { partitionKey: 'api' })).resolves.toBe(statePath);
    expect(log.args.flat().join(' ')).not.toContain(statePath);
    expect(log.args.flat().join(' ')).not.toContain(identity.email);
    expect(fs.existsSync(failurePath)).toBe(false);
    await expect(capture(identity, { partitionKey: 'api', force: true })).rejects.toThrow(/process exited/i);
    const fingerprint = sessionCapture.readStorageStateFingerprint(statePath)!;
    await expect(capture(identity, { partitionKey: 'api', force: true, expectedStaleSession: { storageStatePath: statePath, storageStateFingerprint: fingerprint } })).rejects.toThrow(/process exited/i);
    await expect(capture(identity, { partitionKey: 'api', force: true, expectedStaleSession: { storageStatePath: statePath, storageStateFingerprint: 'different' } })).resolves.toBe(statePath);
    await expect(capture(identity, { partitionKey: 'api', expectedStaleSession: { storageStatePath: `${statePath}.other`, storageStateFingerprint: 'different' } })).rejects.toThrow(/does not match/i);
  } finally {
    log.restore();
    if (previousOptions === undefined) {
      delete process.env.NODE_OPTIONS;
    } else {
      process.env.NODE_OPTIONS = previousOptions;
    }
    fs.rmSync(statePath, { force: true });
    fs.rmSync(failurePath, { force: true });
  }
});

test('an old capture owner cannot overwrite successor failure metadata', async () => {
  const identity = { userIdentifier: 'fake-owner-replaced', email: `fake-owner-${Date.now()}@example.invalid`, password: 'synthetic' };
  const statePath = getSessionStatePath(identity, 'api');
  const lockDirectory = `${statePath}.lock.lock`;
  const failurePath = `${statePath}.capture-failed.json`;
  let releaseSnapshot: (() => void) | undefined;
  let markStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    releaseSnapshot = resolve;
  });
  const hidden = { first: () => hidden, isVisible: async () => false };
  const page = {
    goto: async () => undefined,
    url: () => `${config.baseUrl}organisation`,
    locator: () => hidden,
    getByRole: () => hidden,
    request: { get: async () => ({ status: () => 200, text: async () => 'true' }) },
    context: () => context
  };
  const context = {
    newPage: async () => page,
    cookies: async () => [],
    storageState: async ({ path: output }: { path: string }) => {
 markStarted!(); await waiting; fs.writeFileSync(output, '{}');
    }
  };
  const browser = { newContext: async () => context, close: async () => undefined };
  const stub = sinon.stub(chromium, 'launch').resolves(browser as never);
  try {
    const capture = sessionCaptureInProcess(identity, { force: true, partitionKey: 'api' });
    await started;
    fs.rmSync(lockDirectory, { recursive: true });
    fs.mkdirSync(lockDirectory);
    fs.writeFileSync(path.join(lockDirectory, 'owner'), 'successor');
    fs.writeFileSync(failurePath, 'successor');
    releaseSnapshot!();
    await expect(capture).rejects.toThrow(/ownership/);
    expect(fs.readFileSync(failurePath, 'utf8')).toBe('successor');
    expect(fs.readFileSync(path.join(lockDirectory, 'owner'), 'utf8')).toBe('successor');
  } finally {
    stub.restore();
    fs.rmSync(lockDirectory, { recursive: true, force: true });
    fs.rmSync(statePath, { force: true });
    fs.rmSync(failurePath, { force: true });
  }
});

test('a rejected pending launch after cancellation releases without starting authentication', async () => {
  const identity = { userIdentifier: 'fake-launch-reject', email: `fake-launch-reject-${Date.now()}@example.invalid`, password: 'synthetic' };
  const statePath = getSessionStatePath(identity, 'api');
  const lockDirectory = `${statePath}.lock.lock`;
  const controller = new AbortController();
  let rejectLaunch: ((error: Error) => void) | undefined;
  let launchStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    launchStarted = resolve;
  });
  const launching = new Promise((_, reject) => {
    rejectLaunch = reject;
  });
  const stub = sinon.stub(chromium, 'launch').callsFake(async () => {
 launchStarted!(); return launching as never;
  });
  try {
    const capture = sessionCaptureInProcess(identity, { force: true, partitionKey: 'api' }, controller.signal);
    const result = expect(capture).rejects.toThrow();
    await started;
    controller.abort();
    rejectLaunch!(new Error('synthetic launch failed'));
    await result;
    expect(stub.callCount).toBe(1);
    expect(fs.existsSync(lockDirectory)).toBe(false);
    expect(fs.existsSync(statePath)).toBe(false);
    expect(fs.existsSync(`${statePath}.capture-failed.json`)).toBe(false);
  } finally {
    stub.restore();
    fs.rmSync(lockDirectory, { recursive: true, force: true });
    fs.rmSync(statePath, { force: true });
    fs.rmSync(`${statePath}.capture-failed.json`, { force: true });
  }
});

test('a browser returned after cancellation must close before releasing the lock', async () => {
  const identity = { userIdentifier: 'fake-late-launch', email: `fake-late-launch-${Date.now()}@example.invalid`, password: 'synthetic' };
  const statePath = getSessionStatePath(identity, 'api');
  const lockDirectory = `${statePath}.lock.lock`;
  const controller = new AbortController();
  let resolveLaunch: ((browser: unknown) => void) | undefined;
  let resolveClose: (() => void) | undefined;
  let launchStarted: (() => void) | undefined;
  let closeStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    launchStarted = resolve;
  });
  const closing = new Promise<void>((resolve) => {
    closeStarted = resolve;
  });
  const launch = new Promise((resolve) => {
    resolveLaunch = resolve;
  });
  const closed = new Promise<void>((resolve) => {
    resolveClose = resolve;
  });
  const newContext = sinon.stub().rejects(new Error('must not create context'));
  const browser = { newContext, close: async () => {
 closeStarted!(); await closed;
  } };
  const stub = sinon.stub(chromium, 'launch').callsFake(async () => {
 launchStarted!(); return launch as never;
  });
  try {
    const capture = sessionCaptureInProcess(identity, { force: true, partitionKey: 'api' }, controller.signal);
    const result = expect(capture).rejects.toThrow();
    await started;
    controller.abort();
    resolveLaunch!(browser);
    await closing;
    expect(fs.existsSync(lockDirectory)).toBe(true);
    expect(newContext.called).toBe(false);
    resolveClose!();
    await result;
    expect(fs.existsSync(lockDirectory)).toBe(false);
    expect(fs.existsSync(statePath)).toBe(false);
    expect(fs.existsSync(`${statePath}.capture-failed.json`)).toBe(false);
  } finally {
    stub.restore();
    fs.rmSync(lockDirectory, { recursive: true, force: true });
    fs.rmSync(statePath, { force: true });
    fs.rmSync(`${statePath}.capture-failed.json`, { force: true });
  }
});

test('child IPC preserves both ownership loss and browser closure failure without secrets', async () => {
  const identity = { userIdentifier: 'fake-both', email: `fake-both-${Date.now()}@example.invalid`, password: 'synthetic-password-secret' };
  const statePath = getSessionStatePath(identity, 'api');
  const lockDirectory = `${statePath}.lock.lock`;
  const failurePath = `${statePath}.capture-failed.json`;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-child-both-'));
  const preload = path.join(directory, 'preload.cjs');
  const playwright = require.resolve('@playwright/test');
  fs.writeFileSync(preload, `
const fs = require('node:fs'); const path = require('node:path');
const { chromium } = require(${JSON.stringify(playwright)});
const hidden = { first: () => hidden, isVisible: async () => false };
const page = { goto: async () => {}, url: () => 'http://127.0.0.1/organisation', locator: () => hidden, getByRole: () => hidden, request: { get: async () => ({ status: () => 200, text: async () => 'true' }) }, context: () => context };
const context = { newPage: async () => page, cookies: async () => [], storageState: async ({ path: output }) => {
  const state = output.replace(/\\.\\d+\\.\\d+\\.tmp$/, ''); const lock = state + '.lock.lock';
  fs.rmSync(lock, { recursive: true }); fs.mkdirSync(lock); fs.writeFileSync(path.join(lock, 'owner'), 'successor');
  fs.writeFileSync(state + '.capture-failed.json', 'successor'); fs.writeFileSync(output, '{}');
} };
chromium.launch = async () => ({ newContext: async () => context, close: async () => { throw new Error('synthetic-secret-close'); } });
`);
  const previousOptions = process.env.NODE_OPTIONS;
  process.env.NODE_OPTIONS = `${previousOptions || ''} --require=${preload}`.trim();
  try {
    const { sessionCapture: capture } = await import('../helpers/sessionCapture');
    const error = await capture(identity, { force: true, partitionKey: 'api' }).then(() => new Error('unexpected success'), (failure: Error) => failure);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { serializeError } = require('playwright/lib/util');
    expect(serializeError(error).message).toContain('Session capture lock ownership was lost.');
    expect(serializeError(error).message).toContain('Browser close failed; session capture lock retained.');
    expect(JSON.stringify(serializeError(error))).not.toContain('synthetic-secret');
    expect(JSON.stringify(serializeError(error))).not.toContain(identity.email);
    expect(fs.readFileSync(failurePath, 'utf8')).toBe('successor');
    expect(fs.readFileSync(path.join(lockDirectory, 'owner'), 'utf8')).toBe('successor');
  } finally {
    if (previousOptions === undefined) {
      delete process.env.NODE_OPTIONS;
    } else {
      process.env.NODE_OPTIONS = previousOptions;
    }
    fs.rmSync(lockDirectory, { recursive: true, force: true });
    fs.rmSync(failurePath, { force: true });
    fs.rmSync(statePath, { force: true });
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

for (const [label, cause, expected] of [
  ['network', 'net::ERR_CONNECTION_RESET synthetic-secret-network', 'A network error interrupted session capture.'],
  ['authentication', 'Session capture did not create an authenticated session for synthetic-secret-account', 'Session capture authentication was rejected.'],
  ['timeout', 'synthetic-secret-timeout', 'Session capture timed out.']
] as const) {
  test(`child IPC preserves safe ${label} cause when browser closure fails`, async () => {
    const identity = { userIdentifier: 'fake-combined', email: `fake-combined-${Date.now()}@example.invalid`, password: 'synthetic-password-secret' };
    const statePath = getSessionStatePath(identity, 'api');
    const lockDirectory = `${statePath}.lock.lock`;
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-child-combined-'));
    const preload = path.join(directory, 'preload.cjs');
    const playwright = require.resolve('@playwright/test');
    fs.writeFileSync(preload, `const { chromium } = require(${JSON.stringify(playwright)}); chromium.launch = async () => ({ newContext: async () => { const error = new Error(${JSON.stringify(cause)}); error.name = ${JSON.stringify(label === 'timeout' ? 'TimeoutError' : 'Error')}; throw error; }, close: async () => { throw new Error('synthetic-secret-close'); } });`);
    const previousOptions = process.env.NODE_OPTIONS;
    process.env.NODE_OPTIONS = `${previousOptions || ''} --require=${preload}`.trim();
    const warning = sinon.stub(console, 'warn');
    try {
      const { sessionCapture: capture } = await import('../helpers/sessionCapture');
      const error = await capture(identity, { force: true, partitionKey: 'api' }).then(() => new Error('unexpected success'), (failure: Error) => failure);
      expect(warning.called).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { serializeError } = require('playwright/lib/util');
      const serialized = serializeError(error);
      expect(serialized.message).toContain(expected);
      expect(serialized.message).toContain('Browser close failed; session capture lock retained.');
      expect(JSON.stringify(serialized)).not.toContain('synthetic-secret');
      expect(JSON.stringify(serialized)).not.toContain(identity.email);
      expect(fs.existsSync(lockDirectory)).toBe(true);
    } finally {
      warning.restore();
      if (previousOptions === undefined) {
        delete process.env.NODE_OPTIONS;
      } else {
        process.env.NODE_OPTIONS = previousOptions;
      }
      fs.rmSync(lockDirectory, { recursive: true, force: true });
      fs.rmSync(`${statePath}.capture-failed.json`, { force: true });
      fs.rmSync(statePath, { force: true });
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}

test('retry warning is emitted only after closure and before an actual next attempt', async () => {
  const identity = { userIdentifier: 'fake-retry-warning', email: `fake-retry-${Date.now()}@example.invalid`, password: 'synthetic' };
  const statePath = getSessionStatePath(identity, 'api');
  const events: string[] = [];
  const first = { newContext: async () => {
    events.push('first-attempt'); throw new Error('net::ERR_CONNECTION_RESET');
  }, close: async () => {
    events.push('first-closed');
  } };
  const second = { newContext: async () => {
    events.push('second-attempt'); throw new Error('non-retryable synthetic failure');
  }, close: async () => undefined };
  const launch = sinon.stub(chromium, 'launch');
  launch.onFirstCall().resolves(first as never);
  launch.onSecondCall().resolves(second as never);
  const warning = sinon.stub(console, 'warn').callsFake(() => {
    events.push('retry-warning');
  });
  try {
    await expect(sessionCaptureInProcess(identity, { force: true, partitionKey: 'api' })).rejects.toThrow('non-retryable synthetic failure');
    expect(events).toEqual(['first-attempt', 'first-closed', 'retry-warning', 'second-attempt']);
    expect(warning.callCount).toBe(1);
  } finally {
    warning.restore();
    launch.restore();
    fs.rmSync(`${statePath}.lock.lock`, { recursive: true, force: true });
    fs.rmSync(`${statePath}.capture-failed.json`, { force: true });
    fs.rmSync(statePath, { force: true });
  }
});

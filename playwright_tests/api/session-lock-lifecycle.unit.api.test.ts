import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { spawn, fork, type ChildProcess } from 'node:child_process';
import { cleanupLifecycleFixture, lifecycleProcessRegistration, stopLifecycleProcess, type OwnedLifecycleProcess } from '../helpers/sessionLifecycleProcesses';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

const testPassword = randomBytes(32).toString('hex');

test('lifecycle fixture cleanup tracks a hanging launch and escalates ignored termination', async () => {
  test.skip(process.platform === 'win32', 'Synthetic lifecycle cleanup uses POSIX process identity checks.');
  test.setTimeout(15_000);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-hanging-launch-'));
  const registry = path.join(directory, 'owner-pids');
  const entered = path.join(directory, 'launch-entered');
  const preload = path.join(directory, 'hanging-launch.cjs');
  fs.writeFileSync(preload, `
${lifecycleProcessRegistration(registry, `ao-session-${path.basename(directory).toLowerCase()}`)}
const fs = require('node:fs');
const { chromium } = require(${JSON.stringify(require.resolve('@playwright/test'))});
chromium.launch = async () => {
  process.on('SIGTERM', () => {});
  fs.writeFileSync(${JSON.stringify(entered)}, String(process.pid));
  setInterval(() => {}, 1000);
  return new Promise(() => {});
};`);
  const child = fork(require.resolve('../helpers/session-capture-child.cjs'), [], {
    detached: true,
    env: { ...process.env, NODE_OPTIONS: `--require=${preload}`, PW_SESSION_DIR: directory },
    stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  });
  try {
    child.send({ identity: { userIdentifier: 'hang', email: 'hang@example.invalid', password: testPassword }, options: { force: true, partitionKey: 'api' }, baseUrl: 'http://127.0.0.1:1/', idamWebUrl: 'http://127.0.0.1:1/' });
    await expect.poll(() => fs.existsSync(entered), { timeout: 5_000 }).toBe(true);
    const owner = JSON.parse(fs.readFileSync(registry, 'utf8').trim()) as OwnedLifecycleProcess;
    expect(owner.pid).toBe(child.pid);
    await expect(cleanupLifecycleFixture(directory, [{ ...owner, title: `${owner.title}-mismatch` }])).rejects.toThrow('fixture retained');
    expect(fs.existsSync(registry)).toBe(true);
    expect(child.exitCode).toBe(null);
    const started = Date.now();
    const exited = new Promise((resolve) => child.once('exit', resolve));
    await stopLifecycleProcess(owner);
    await exited;
    expect(child.signalCode).toBe('SIGKILL');
    expect(Date.now() - started).toBeLessThan(5_000);
  } finally {
    await cleanupLifecycleFixture(directory, child.pid ? [{
      pid: child.pid, title: `ao-session-${path.basename(directory).toLowerCase()}-owner-${child.pid}`, group: true
    }] : []);
  }
});

test('a timed-out worker closes its browser before the next session capture', async () => {
  test.skip(process.platform === 'win32', 'Synthetic lifecycle cleanup uses POSIX process identity checks.');
  test.setTimeout(45_000);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-lifecycle-'));
  const repo = path.resolve(__dirname, '../..');
  const configFile = path.join(directory, 'playwright.config.cjs');
  const specFile = path.join(directory, 'session-timeout.spec.cjs');
  const closedFile = path.join(directory, 'response-closed');
  const closeBarrier = path.join(directory, 'close-observed');
  const ownerPidFile = path.join(directory, 'owner-pids');
  const titlePrefix = `ao-session-${path.basename(directory).toLowerCase()}`;
  const preload = path.join(directory, 'close-barrier.cjs');
  const q = JSON.stringify;
  fs.writeFileSync(preload, `
const fs = require('node:fs');
${lifecycleProcessRegistration(ownerPidFile, titlePrefix)}
const { chromium } = require(${q(require.resolve('@playwright/test'))});
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const close = browser.close.bind(browser);
  browser.close = async (...closeArgs) => {
    await close(...closeArgs);
    const deadline = Date.now() + 10000;
    while (!fs.existsSync(${q(closeBarrier)})) {
      if (Date.now() >= deadline) throw new Error('Synthetic close observation timed out');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };
  return browser;
};`);
  fs.writeFileSync(configFile, `module.exports = { testDir: ${q(directory)}, testMatch: /session-timeout\\.spec\\.cjs/, workers: 1, retries: 0, reporter: 'line', outputDir: ${q(path.join(directory, 'results'))} };`);
  fs.writeFileSync(specFile, `
const fs = require('node:fs');
const { test, expect } = require(${q(path.join(repo, 'node_modules/@playwright/test'))});
process.env.PW_SESSION_DIR = ${q(directory)};
const { config } = require(${q(path.join(repo, 'playwright_tests/config/config.ts'))});
config.base = { username: 'fictional@example.invalid', password: ${JSON.stringify(testPassword)} };
config.baseUrl = process.env.AO_LIFECYCLE_TEST_URL;
const sessions = require(${q(path.join(repo, 'playwright_tests/helpers/sessionCapture.ts'))});
test('intentional worker timeout', async () => {
  test.setTimeout(8000);
  await sessions.sessionCapture('base', { force: true, partitionKey: 'api' });
});
test('successor captures after prior response closes', async () => {
  const state = sessions.getSessionStatePath('base', 'api');
  await expect.poll(() => fs.existsSync(state + '.lock.lock'), { timeout: 20000 }).toBe(false);
  expect(fs.readFileSync(${q(closedFile)}, 'utf8')).toBe('lock-held');
  expect(fs.existsSync(state + '.capture-failed.json')).toBe(false);
  const captured = await sessions.sessionCapture('base', { force: true, partitionKey: 'api' });
  expect(fs.existsSync(captured)).toBe(true);
});
`);
  let received = false;
  let responseClosed = false;
  const server = http.createServer((request, response) => {
    if (!received) {
      received = true;
      response.on('close', () => {
        if (!response.writableFinished) {
          responseClosed = true;
          const held = fs.readdirSync(directory).some((name) => name.endsWith('.lock.lock'));
          fs.writeFileSync(closedFile, held ? 'lock-held' : 'unlocked-too-early');
          fs.writeFileSync(closeBarrier, 'observed');
        }
      });
      return;
    }
    if (request.url === '/auth/login') {
      response.writeHead(302, { location: '/organisation' });
      response.end();
      return;
    }
    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end(request.url === '/auth/isAuthenticated' ? 'true' : 'Ready');
  });
  let child: ChildProcess | undefined;
  let watchdog: NodeJS.Timeout | undefined;
  let watchdogCleanup: Promise<void> | undefined;
  try {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Local server has no TCP address');
    }
    child = spawn(process.execPath, [path.join(repo, 'node_modules/@playwright/test/cli.js'), 'test', '-c', configFile], {
      cwd: repo,
      env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${preload}`.trim(), AO_LIFECYCLE_TEST_URL: `http://127.0.0.1:${address.port}/` },
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const nested = child;
    watchdog = setTimeout(() => {
      if (nested.pid && nested.exitCode === null && nested.signalCode === null) {
        watchdogCleanup = stopLifecycleProcess({ pid: nested.pid, title: `${titlePrefix}-runner-${nested.pid}`, group: true });
        void watchdogCleanup.catch(() => undefined);
      }
    }, 30_000);
    let output = '';
    child.stdout!.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.stderr!.on('data', (chunk) => {
      output += chunk.toString();
    });
    const code = await new Promise<number | null>((resolve, reject) => {
      nested.once('error', reject);
      nested.once('close', resolve);
    });
    expect(code).toBe(1);
    expect(received).toBe(true);
    expect(responseClosed).toBe(true);
    expect(output).toContain('1 failed');
    expect(output).toContain('1 passed');
  } finally {
    clearTimeout(watchdog);
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (watchdogCleanup) {
      await watchdogCleanup.catch(() => undefined);
    }
    const owners: OwnedLifecycleProcess[] = [];
    if (child?.pid && child.exitCode === null && child.signalCode === null) {
      owners.push({ pid: child.pid, title: `${titlePrefix}-runner-${child.pid}`, group: true });
    }
    if (fs.existsSync(ownerPidFile)) {
      for (const row of fs.readFileSync(ownerPidFile, 'utf8').trim().split('\n')) {
        if (row) {
          owners.push(JSON.parse(row) as OwnedLifecycleProcess);
        }
      }
    }
    await cleanupLifecycleFixture(directory, owners);
  }
});

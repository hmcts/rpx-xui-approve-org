import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

test('a timed-out worker closes its browser before the next session capture @e2e @auth', async () => {
  test.setTimeout(45_000);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-session-lifecycle-'));
  const repo = path.resolve(__dirname, '../..');
  const configFile = path.join(directory, 'playwright.config.cjs');
  const specFile = path.join(directory, 'session-timeout.spec.cjs');
  const closedFile = path.join(directory, 'response-closed');
  const q = JSON.stringify;
  fs.writeFileSync(configFile, `module.exports = { testDir: ${q(directory)}, testMatch: /session-timeout\\.spec\\.cjs/, workers: 1, retries: 0, reporter: 'line', outputDir: ${q(path.join(directory, 'results'))} };`);
  fs.writeFileSync(specFile, `
const fs = require('node:fs');
const { test, expect } = require(${q(path.join(repo, 'node_modules/@playwright/test'))});
process.env.PW_SESSION_DIR = ${q(directory)};
const { config } = require(${q(path.join(repo, 'playwright_tests/config/config.ts'))});
config.base = { username: 'fictional@example.invalid', password: 'synthetic' };
config.baseUrl = process.env.AO_LIFECYCLE_TEST_URL;
const sessions = require(${q(path.join(repo, 'playwright_tests/helpers/sessionCapture.ts'))});
test('intentional worker timeout', async () => {
  test.setTimeout(8000);
  await sessions.sessionCapture('base', { force: true, partitionKey: 'api' });
});
test('successor captures after prior response closes', async () => {
  const state = sessions.getSessionStatePath('base', 'api');
  await expect.poll(() => fs.existsSync(state + '.lock.lock'), { timeout: 20000 }).toBe(false);
  expect(fs.existsSync(${q(closedFile)})).toBe(true);
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
          fs.writeFileSync(closedFile, 'closed');
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
  try {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Local server has no TCP address');
    }
    const child = spawn(process.execPath, [path.join(repo, 'node_modules/@playwright/test/cli.js'), 'test', '-c', configFile], {
      cwd: repo,
      env: { ...process.env, AO_LIFECYCLE_TEST_URL: `http://127.0.0.1:${address.port}/` },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
    expect(code).toBe(1);
    expect(received).toBe(true);
    expect(responseClosed).toBe(true);
    expect(output).toContain('1 failed');
    expect(output).toContain('1 passed');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

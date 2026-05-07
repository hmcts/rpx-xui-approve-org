import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from '../config/config';

const DEFAULT_SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const SESSION_DIR = process.env.PW_SESSION_DIR
  ? path.resolve(process.env.PW_SESSION_DIR)
  : path.resolve(__dirname, '../../.sessions');

type UserConfig = {
  username: string;
  password: string;
};

type SessionCaptureOptions = {
  force?: boolean;
  partitionKey?: string;
};

function normaliseSessionStorageKey(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function resolveSessionMaxAgeMs(): number {
  const configured = Number(process.env.PW_SESSION_MAX_AGE_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_MAX_AGE_MS;
}

function getUserConfig(user: string): UserConfig {
  const account = (config as unknown as Record<string, UserConfig>)[user];
  if (!account?.username || !account?.password) {
    throw new Error(`Missing Playwright credentials for user "${user}".`);
  }
  return account;
}

function resolveSessionPartitionKey(explicitPartitionKey?: string): string | undefined {
  const configured = explicitPartitionKey?.trim();
  if (configured) {
    return configured;
  }

  const fromParallelIndex = process.env.TEST_PARALLEL_INDEX?.trim();
  if (fromParallelIndex) {
    return `parallel-${fromParallelIndex}`;
  }

  const fromWorkerIndex = process.env.TEST_WORKER_INDEX?.trim();
  if (fromWorkerIndex) {
    return `worker-${fromWorkerIndex}`;
  }

  return undefined;
}

export function getSessionStatePath(user: string = 'base', partitionKey?: string): string {
  const { username } = getUserConfig(user);
  const compositeKey = partitionKey ? `${username}.${partitionKey}` : username;
  const key = normaliseSessionStorageKey(compositeKey);
  return path.join(SESSION_DIR, `${key}.storage.json`);
}

function hasUnexpiredAuthCookie(storageStatePath: string): boolean {
  try {
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as { cookies?: Array<{ name?: string; expires?: number }> };
    const cookies = state.cookies ?? [];
    const nowSeconds = Date.now() / 1000;
    return cookies.some((cookie) => {
      const name = cookie.name ?? '';
      if (name !== '__auth__' && name !== 'Idam.Session' && name !== 'ao-webapp') {
        return false;
      }
      if (cookie.expires === undefined || cookie.expires === -1) {
        return true;
      }
      return cookie.expires > nowSeconds + 30;
    });
  } catch {
    return false;
  }
}

function isSessionFresh(storageStatePath: string): boolean {
  if (!fs.existsSync(storageStatePath)) {
    return false;
  }

  const maxAgeMs = resolveSessionMaxAgeMs();
  const stats = fs.statSync(storageStatePath);
  if (Date.now() - stats.mtimeMs > maxAgeMs) {
    return false;
  }

  return hasUnexpiredAuthCookie(storageStatePath);
}

async function launchBrowserForSessionCapture(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function completeLoginOnPage(page: Page, username: string, password: string): Promise<void> {
  await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

  if (await isAuthenticatedByApi(page)) {
    return;
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const isOnLoginSurface =
      page.url().includes('idam') ||
      page.url().includes('/login') ||
      (await page.getByRole('textbox', { name: 'Email address' }).isVisible().catch(() => false));

    if (!isOnLoginSurface && (await isAuthenticatedByApi(page))) {
      return;
    }

    if (isOnLoginSurface) {
      await page.getByRole('textbox', { name: 'Email address' }).fill(username);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();
    }

    await page.waitForTimeout(1000 * attempt);
    if (await isAuthenticatedByApi(page)) {
      return;
    }
  }

  throw new Error(`Unable to authenticate "${username}" and capture Playwright session state.`);
}

async function isAuthenticatedByApi(page: Page): Promise<boolean> {
  try {
    const authCheckUrl = new URL('auth/isAuthenticated', config.baseUrl).toString();
    const response = await page.request.get(authCheckUrl, { failOnStatusCode: false });
    if (response.status() !== 200) {
      return false;
    }
    const body = await response.json().catch(() => false);
    return body === true;
  } catch {
    return false;
  }
}

async function persistSessionState(context: BrowserContext, storageStatePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  await context.storageState({ path: storageStatePath });
}

export async function sessionCapture(user: string = 'base', options: SessionCaptureOptions = {}): Promise<string> {
  const partitionKey = resolveSessionPartitionKey(options.partitionKey);
  const storageStatePath = getSessionStatePath(user, partitionKey);
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  if (!options.force && isSessionFresh(storageStatePath)) {
    console.log(`[playwright-session] Reusing session: ${storageStatePath}`);
    return storageStatePath;
  }

  const { username, password } = getUserConfig(user);
  const partitionSuffix = partitionKey ? ` [${partitionKey}]` : '';
  console.log(`[playwright-session] Capturing session for ${username}${partitionSuffix} -> ${storageStatePath}`);
  const browser = await launchBrowserForSessionCapture();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await completeLoginOnPage(page, username, password);
    const authenticated = await isAuthenticatedByApi(page);
    if (!authenticated) {
      throw new Error(`Session capture did not create an authenticated session for "${username}".`);
    }
    await persistSessionState(context, storageStatePath);
    return storageStatePath;
  } finally {
    await browser.close();
  }
}

export async function applySessionCookies(page: Page, user: string = 'base', options: SessionCaptureOptions = {}): Promise<void> {
  const loadCookies = (storageStatePath: string): any[] => {
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as { cookies?: any[] };
    return state.cookies ?? [];
  };

  const storageStatePath = await sessionCapture(user, options);
  const cookies = loadCookies(storageStatePath);
  if (cookies.length > 0) {
    await page.context().addCookies(cookies);
  }
}

export async function ensureAuthenticatedPage(page: Page, user: string = 'base', options: SessionCaptureOptions = {}): Promise<void> {
  await applySessionCookies(page, user, options);
  await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

  if (page.url().includes('idam') || page.url().includes('/login')) {
    await sessionCapture(user, { ...options, force: true });
    await applySessionCookies(page, user, options);
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
  }
}

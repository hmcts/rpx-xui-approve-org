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
  baseUrl?: string;
};

function normaliseSessionStorageKey(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function resolveSessionMaxAgeMs(): number {
  const configured = Number(process.env.PW_SESSION_MAX_AGE_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_MAX_AGE_MS;
}

function resolveCredentialHint(user: string): string {
  if (user === 'api') {
    return 'Set APPROVE_ORG_API_USERNAME/APPROVE_ORG_API_PASSWORD.';
  }

  return 'Set APPROVE_ORG_ADMIN_USERNAME/APPROVE_ORG_ADMIN_PASSWORD.';
}

function getUserConfig(user: string): UserConfig {
  const account = (config as unknown as Record<string, UserConfig>)[user];
  if (!account?.username || !account?.password) {
    throw new Error(
      `Missing Playwright credentials for user "${user}". ${resolveCredentialHint(user)}`
    );
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

export function getSessionStatePath(user: string = 'base', partitionKey?: string, baseUrl?: string): string {
  const { username } = getUserConfig(user);
  const hostKey = baseUrl?.trim() ? new URL(baseUrl).host : '';
  const compositeKey = [username, hostKey, partitionKey].filter(Boolean).join('.');
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

function resolveBaseUrl(options: SessionCaptureOptions = {}): string {
  return options.baseUrl?.trim() || config.baseUrl;
}

async function waitForVisibleLocator(page: Page, selectors: string[], timeoutMs: number = 5000): Promise<string | null> {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
      return selector;
    } catch {
      continue;
    }
  }

  return null;
}

async function isModernLoginSurfaceVisible(page: Page): Promise<boolean> {
  return page.getByRole('textbox', { name: /Email address|Enter your work email address/i }).isVisible().catch(() => false);
}

async function detectLoginSurface(page: Page): Promise<'legacy' | 'modern' | null> {
  const legacyUsernameSelector = await waitForVisibleLocator(page, [
    'input[name="username"]',
    'input[autocomplete="username"]',
    'input[type="email"]',
    'input[type="text"]',
    '#username'
  ], 60_000);
  const legacyPasswordSelector = await waitForVisibleLocator(page, [
    'input[name="password"]',
    'input[autocomplete="current-password"]',
    'input[type="password"]',
    '#password'
  ], 60_000);

  if (legacyUsernameSelector && legacyPasswordSelector) {
    return 'legacy';
  }

  if (await isModernLoginSurfaceVisible(page)) {
    return 'modern';
  }

  return null;
}

async function submitLegacyLogin(page: Page, username: string, password: string): Promise<void> {
  const usernameSelector = await waitForVisibleLocator(page, [
    'input[name="username"]',
    'input[autocomplete="username"]',
    'input[type="email"]',
    'input[type="text"]',
    '#username'
  ], 60_000);
  const passwordSelector = await waitForVisibleLocator(page, [
    'input[name="password"]',
    'input[autocomplete="current-password"]',
    'input[type="password"]',
    '#password'
  ], 60_000);

  if (!usernameSelector || !passwordSelector) {
    throw new Error(`Login form not recognised on ${page.url()}`);
  }

  await page.locator(usernameSelector).fill(username);
  await page.locator(passwordSelector).fill(password);

  const submitSelector = await waitForVisibleLocator(page, [
    '#login-submit-btn',
    'input.button',
    'button[type="submit"]'
  ], 3000);
  if (submitSelector) {
    await page.locator(submitSelector).click();
    return;
  }

  await page.getByRole('button', { name: /Sign in|Login/i }).click();
}

async function submitModernLogin(page: Page, username: string, password: string): Promise<void> {
  const emailTextbox = page.getByRole('textbox', { name: /Email address|Enter your work email address/i });
  const passwordTextbox = page.getByRole('textbox', { name: 'Password' });
  const signInButton = page.getByRole('button', { name: /Sign in|Login/i });

  await emailTextbox.fill(username);
  await passwordTextbox.fill(password);
  await signInButton.click();
}

async function completeLoginOnPage(page: Page, username: string, password: string, baseUrl: string): Promise<void> {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  if (await isAuthenticatedByApi(page, baseUrl)) {
    return;
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const loginSurface = await detectLoginSurface(page);

    if (!loginSurface && (await isAuthenticatedByApi(page, baseUrl))) {
      return;
    }

    if (loginSurface === 'legacy') {
      await submitLegacyLogin(page, username, password);
    } else if (loginSurface === 'modern') {
      await submitModernLogin(page, username, password);
    }

    await page.waitForTimeout(1500 * attempt);
    if (await isAuthenticatedByApi(page, baseUrl)) {
      return;
    }
  }

  throw new Error(`Unable to authenticate "${username}" and capture Playwright session state.`);
}

async function isAuthenticatedByApi(page: Page, baseUrl: string = config.baseUrl): Promise<boolean> {
  try {
    const authCheckUrl = new URL('auth/isAuthenticated', baseUrl).toString();
    const response = await page.request.get(authCheckUrl, { failOnStatusCode: false });
    if (response.status() !== 200) {
      return false;
    }
    const rawBody = (await response.text()).trim().toLowerCase();
    if (rawBody === 'true') {
      return true;
    }
    if (rawBody === 'false' || rawBody.length === 0) {
      return false;
    }

    try {
      return JSON.parse(rawBody) === true;
    } catch {
      return false;
    }
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
  const baseUrl = resolveBaseUrl(options);
  const storageStatePath = getSessionStatePath(user, partitionKey, baseUrl);
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
    await completeLoginOnPage(page, username, password, baseUrl);
    const authenticated = await isAuthenticatedByApi(page, baseUrl);
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
  const isLoginUrl = (): boolean => page.url().includes('idam') || page.url().includes('/login');

  const gotoAndVerify = async (): Promise<boolean> => {
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
    if (isLoginUrl()) {
      return false;
    }

    return isAuthenticatedByApi(page);
  };

  await applySessionCookies(page, user, options);
  if (await gotoAndVerify()) {
    return;
  }

  await sessionCapture(user, { ...options, force: true });
  await applySessionCookies(page, user, options);
  if (await gotoAndVerify()) {
    return;
  }

  throw new Error(`Unable to ensure authenticated page for user "${user}".`);
}

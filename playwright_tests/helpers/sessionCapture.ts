import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from '../config/config';

const DEFAULT_SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const SESSION_CAPTURE_LOCK_TIMEOUT_MS = 120_000;
const SESSION_CAPTURE_LOCK_STALE_MS = 120_000;
const SESSION_CAPTURE_LOCK_RETRY_MS = 500;
const AUTHENTICATION_TIMEOUT_MS = 30_000;
const AUTHENTICATION_POLL_INTERVAL_MS = 500;
const LOGIN_REDIRECT_TIMEOUT_MS = 45_000;
const SESSION_DIR = process.env.PW_SESSION_DIR
  ? path.resolve(process.env.PW_SESSION_DIR)
  : path.resolve(__dirname, '../../.sessions');
const OAUTH_CALLBACK_ROUTE_PATTERN = /\/oauth2\/callback(?:[/?#]|$)/;

type UserConfig = {
  username: string;
  password: string;
};

type SessionCaptureOptions = {
  force?: boolean;
  partitionKey?: string;
};

type AuthenticationState = {
  authenticated: boolean;
  status?: number;
  body?: string;
  error?: string;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLockStale(lockPath: string): boolean {
  try {
    const stats = fs.statSync(lockPath);
    return Date.now() - stats.mtimeMs > SESSION_CAPTURE_LOCK_STALE_MS;
  } catch {
    return false;
  }
}

async function acquireSessionCaptureLock(lockPath: string): Promise<() => void> {
  const startTime = Date.now();

  while (Date.now() - startTime < SESSION_CAPTURE_LOCK_TIMEOUT_MS) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));

      return () => {
        fs.closeSync(fd);
        fs.rmSync(lockPath, { force: true });
      };
    } catch (error) {
      const errorCode = (error as NodeJS.ErrnoException).code;
      if (errorCode !== 'EEXIST') {
        throw error;
      }

      if (isLockStale(lockPath)) {
        fs.rmSync(lockPath, { force: true });
      } else {
        await sleep(SESSION_CAPTURE_LOCK_RETRY_MS);
      }
    }
  }

  throw new Error(`Timed out waiting for Playwright session capture lock: ${lockPath}`);
}

async function withSessionCaptureLock<T>(lockPath: string, callback: () => Promise<T>): Promise<T> {
  const releaseLock = await acquireSessionCaptureLock(lockPath);
  try {
    return await callback();
  } finally {
    releaseLock();
  }
}

async function getAuthenticationState(page: Page): Promise<AuthenticationState> {
  try {
    const authCheckUrl = new URL('auth/isAuthenticated', config.baseUrl).toString();
    const response = await page.request.get(authCheckUrl, { failOnStatusCode: false });
    const body = (await response.text()).trim();
    const normalisedBody = body.toLowerCase();

    if (response.status() !== 200) {
      return { authenticated: false, status: response.status(), body };
    }

    if (normalisedBody === 'true') {
      return { authenticated: true, status: response.status(), body };
    }

    if (normalisedBody === 'false' || normalisedBody.length === 0) {
      return { authenticated: false, status: response.status(), body };
    }

    try {
      return { authenticated: JSON.parse(normalisedBody) === true, status: response.status(), body };
    } catch {
      return { authenticated: false, status: response.status(), body };
    }
  } catch (error) {
    return { authenticated: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function waitForAuthenticatedByApi(page: Page, timeoutMs = AUTHENTICATION_TIMEOUT_MS): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if ((await getAuthenticationState(page)).authenticated) {
      return true;
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }

    await sleep(Math.min(AUTHENTICATION_POLL_INTERVAL_MS, remainingMs));
  }

  return false;
}

async function firstVisibleText(page: Page, selector: string): Promise<string | undefined> {
  const locator = page.locator(selector).first();
  if (!(await locator.isVisible().catch(() => false))) {
    return undefined;
  }

  return locator.innerText().then((text) => text.replace(/\s+/g, ' ').trim()).catch(() => undefined);
}

async function loginFailureContext(page: Page): Promise<string> {
  const authState = await getAuthenticationState(page);
  const pageTitle = await page.title().catch(() => '<unavailable>');
  const visibleErrorText = await firstVisibleText(
    page,
    '.govuk-error-summary, .error-summary, .error-message, .validation-error, [role="alert"]'
  );
  const context = [
    `currentUrl=${page.url()}`,
    `title=${pageTitle}`,
    `authStatus=${authState.status ?? 'unavailable'}`,
    `authBody=${authState.body ?? authState.error ?? '<empty>'}`
  ];

  if (visibleErrorText) {
    context.push(`visibleError=${visibleErrorText}`);
  }

  return context.join(' | ');
}

function isOAuthCallbackUrl(url: string): boolean {
  return OAUTH_CALLBACK_ROUTE_PATTERN.test(url);
}

function authLoginUrl(): string {
  return new URL('auth/login', config.baseUrl).toString();
}

function isIdamUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes('idam');
  } catch {
    return url.includes('idam');
  }
}

async function isLoginInputVisible(page: Page): Promise<boolean> {
  const namedUsernameInput = page.locator('input[name="username"]');
  const roleEmailInput = page.getByRole('textbox', { name: /Email address|Enter your work email address/i });
  const fallbackEmailInput = page.locator('input[type="email"]').first();

  return (await namedUsernameInput.isVisible().catch(() => false)) ||
    (await roleEmailInput.isVisible().catch(() => false)) ||
    (await fallbackEmailInput.isVisible().catch(() => false));
}

async function isOnLoginOrCallbackSurface(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return currentUrl.includes('/login') ||
    isIdamUrl(currentUrl) ||
    isOAuthCallbackUrl(currentUrl) ||
    await isLoginInputVisible(page);
}

async function waitForLoginRedirectToSettle(page: Page, timeoutMs = LOGIN_REDIRECT_TIMEOUT_MS): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const currentUrl = page.url();
    const onLoginOrCallbackSurface = await isOnLoginOrCallbackSurface(page);
    const pageTitle = await page.title().catch(() => '');

    if (isOAuthCallbackUrl(currentUrl) && pageTitle.toLowerCase() === 'error') {
      return;
    }

    if (!onLoginOrCallbackSurface) {
      return;
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }

    await sleep(Math.min(AUTHENTICATION_POLL_INTERVAL_MS, remainingMs));
  }
}

async function completeLoginOnPage(page: Page, username: string, password: string): Promise<void> {
  await page.goto(authLoginUrl(), { waitUntil: 'domcontentloaded' });

  if (!(await isOnLoginOrCallbackSurface(page)) && await waitForAuthenticatedByApi(page, 5_000)) {
    return;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    if (attempt > 1) {
      await page.context().clearCookies();
      await page.goto(authLoginUrl(), { waitUntil: 'domcontentloaded' });
    }

    const namedUsernameInput = page.locator('input[name="username"]');
    const roleEmailInput = page.getByRole('textbox', { name: /Email address|Enter your work email address/i });
    const fallbackEmailInput = page.locator('input[type="email"]').first();
    const hasNamedUsernameInput = await namedUsernameInput.isVisible().catch(() => false);
    const hasRoleEmailInput = await roleEmailInput.isVisible().catch(() => false);
    const hasFallbackEmailInput = await fallbackEmailInput.isVisible().catch(() => false);
    const isOnLoginSurface =
      page.url().includes('idam') ||
      page.url().includes('/login') ||
      hasNamedUsernameInput ||
      hasRoleEmailInput ||
      hasFallbackEmailInput;

    if (!isOnLoginSurface && (await isAuthenticatedByApi(page))) {
      return;
    }

    if (isOnLoginSurface) {
      if (hasNamedUsernameInput) {
        await namedUsernameInput.fill(username);
        await page.locator('input[name="password"]').fill(password);
        await page.locator('#login-submit-btn').click();
        await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined);
        await waitForLoginRedirectToSettle(page);
      } else if (hasRoleEmailInput || hasFallbackEmailInput) {
        const emailInput = hasRoleEmailInput ? roleEmailInput : fallbackEmailInput;
        await emailInput.fill(username);
        await page.locator('input[type="password"], input[name="password"]').first().fill(password);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined);
        await waitForLoginRedirectToSettle(page);
      } else {
        // Login page can be in a transition state; retry instead of timing out on non-visible inputs.
        await sleep(500 * attempt);
      }
    }

    if (!(await isOnLoginOrCallbackSurface(page)) && await waitForAuthenticatedByApi(page, 5_000)) {
      return;
    }
  }

  throw new Error(
    `Unable to authenticate "${username}" and capture Playwright session state. ${await loginFailureContext(page)}`
  );
}

async function isAuthenticatedByApi(page: Page): Promise<boolean> {
  return (await getAuthenticationState(page)).authenticated;
}

async function persistSessionState(context: BrowserContext, storageStatePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  await context.storageState({ path: storageStatePath });
}

export async function sessionCapture(user: string = 'base', options: SessionCaptureOptions = {}): Promise<string> {
  const partitionKey = resolveSessionPartitionKey(options.partitionKey);
  const storageStatePath = getSessionStatePath(user, partitionKey);
  const lockPath = `${storageStatePath}.lock`;
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  if (!options.force && isSessionFresh(storageStatePath)) {
    console.log(`[playwright-session] Reusing session: ${storageStatePath}`);
    return storageStatePath;
  }

  return withSessionCaptureLock(lockPath, async () => {
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
  });
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

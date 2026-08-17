import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as lockfile from 'proper-lockfile';
import { config } from '../config/config';
import { completeIdamLogin } from './idamLogin';
import { isRetryableSessionCaptureFailure, SESSION_CAPTURE_ATTEMPTS } from './sessionCaptureRetry';

const DEFAULT_SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const AUTHENTICATION_TIMEOUT_MS = 30_000;
const AUTHENTICATION_POLL_INTERVAL_MS = 500;
const LOGIN_REDIRECT_TIMEOUT_MS = 45_000;
const BROWSER_LAUNCH_TIMEOUT_MS = 30_000;
const SESSION_CAPTURE_ATTEMPT_BUDGET_MS = LOGIN_REDIRECT_TIMEOUT_MS + AUTHENTICATION_TIMEOUT_MS + BROWSER_LAUNCH_TIMEOUT_MS;
const SESSION_CAPTURE_LOCK_STALE_MS = SESSION_CAPTURE_ATTEMPT_BUDGET_MS + 30_000;
const SESSION_CAPTURE_LOCK_UPDATE_MS = Math.floor(SESSION_CAPTURE_LOCK_STALE_MS / 3);
const SESSION_CAPTURE_LOCK_TIMEOUT_MS = SESSION_CAPTURE_ATTEMPT_BUDGET_MS * SESSION_CAPTURE_ATTEMPTS + 30_000;
const SESSION_CAPTURE_LOCK_RETRY_MS = 1_000;
const DEFAULT_SESSION_CAPTURE_FAILURE_TTL_MS = 120_000;
const SESSION_DIR = process.env.PW_SESSION_DIR
  ? path.resolve(process.env.PW_SESSION_DIR)
  : path.resolve(__dirname, '../../.sessions');
const OAUTH_CALLBACK_ROUTE_PATTERN = /\/oauth2\/callback(?:[/?#]|$)/;
const DEFAULT_AUTHENTICATED_ROUTE_PATTERN = /^\/(?:organisation|caseworker-details)(?:\/|$)/;
const UNAVAILABLE_ROUTE_PATTERN = /\/(?:access-denied|service-down|not-authorised|signed-out|error)(?:\/|$)/i;
const AUTHENTICATED_SURFACE_TIMEOUT_MS = 5_000;
const AUTHENTICATED_SURFACE_POLL_INTERVAL_MS = 250;

type UserConfig = {
  username: string;
  password: string;
};

export type SessionCaptureOptions = {
  force?: boolean;
  partitionKey?: string;
  // Set only after a rejected navigation to let lock waiters reuse its replacement.
  expectedStaleSession?: RejectedSession;
};

export type SessionIdentity = {
  userIdentifier: string;
  email: string;
  password: string;
  sessionKey?: string;
};

export type SessionIdentityInput = string | SessionIdentity;

type RejectedSession = {
  storageStatePath: string;
  storageStateFingerprint: string;
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

function resolveSessionCaptureFailureTtlMs(): number {
  const configured = Number(process.env.PW_SESSION_CAPTURE_FAILURE_TTL_MS);
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_SESSION_CAPTURE_FAILURE_TTL_MS;
}

function recentSessionCaptureFailureMessage(failurePath: string, now = Date.now()): string | undefined {
  const ttlMs = resolveSessionCaptureFailureTtlMs();
  if (ttlMs === 0 || !fs.existsSync(failurePath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(failurePath, 'utf8')) as {
      timestamp?: number;
      message?: string;
      retryable?: boolean;
    };
    const message = parsed.message?.trim();
    if (parsed.retryable || (message && isRetryableSessionCaptureFailure(message))) {
      return undefined;
    }
    if (!parsed.timestamp || now - parsed.timestamp > ttlMs) {
      return undefined;
    }
    return message || 'previous session capture failed';
  } catch {
    return undefined;
  }
}

function writeSessionCaptureFailure(failurePath: string, error: unknown): void {
  const message = redactSensitiveText(error instanceof Error ? error.message : String(error));

  try {
    fs.writeFileSync(
      failurePath,
      JSON.stringify({
        timestamp: Date.now(),
        message,
        retryable: isRetryableSessionCaptureFailure(message)
      })
    );
  } catch {
    // Best effort only; the original login failure is the useful error.
  }
}

function clearSessionCaptureFailure(failurePath: string): void {
  try {
    fs.rmSync(failurePath, { force: true });
  } catch {
    // Best effort only.
  }
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

function resolveSessionIdentity(input: SessionIdentityInput): SessionIdentity {
  if (typeof input !== 'string') {
    return input;
  }

  const credentials = getUserConfig(input);
  return {
    userIdentifier: input,
    email: credentials.username,
    password: credentials.password
  };
}

function resolveSessionPartitionKey(explicitPartitionKey?: string): string | undefined {
  const configured = explicitPartitionKey?.trim();
  return configured ? configured : undefined;
}

export function getSessionStatePath(user: SessionIdentityInput = 'base', partitionKey?: string): string {
  const identity = resolveSessionIdentity(user);
  const compositeKey = partitionKey ? `${identity.sessionKey ?? identity.email}.${partitionKey}` : identity.sessionKey ?? identity.email;
  const key = normaliseSessionStorageKey(compositeKey);
  return path.join(SESSION_DIR, `${key}.storage.json`);
}

type StorageCookie = { name: string; value: string; expires?: number; domain?: string };

function isCookieCompatibleWithHost(cookieDomain: string | undefined, hostName: string): boolean {
  const normalizedDomain = cookieDomain?.replace(/^\./, '').toLowerCase();
  const normalizedHost = hostName.toLowerCase();
  return !!normalizedDomain && (normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`));
}

function hasUnexpiredAuthCookie(storageStatePath: string, targetUrl = config.baseUrl): boolean {
  try {
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as { cookies?: StorageCookie[] };
    const cookies = state.cookies ?? [];
    const nowSeconds = Date.now() / 1000;
    const targetHost = new URL(targetUrl).hostname;
    return cookies.some((cookie) => {
      const name = cookie.name ?? '';
      if (name !== '__auth__' && name !== 'Idam.Session' && name !== 'ao-webapp') {
        return false;
      }
      if (cookie.domain && !isCookieCompatibleWithHost(cookie.domain, targetHost)) {
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

function isUnexpiredCookie(cookie: StorageCookie): boolean {
  return cookie.expires === undefined || cookie.expires === -1 || cookie.expires > Date.now() / 1000 + 30;
}

function hasPersistableSessionCookies(cookies: StorageCookie[], targetUrl = config.baseUrl): boolean {
  const targetHost = new URL(targetUrl).hostname;
  const idamHost = new URL(config.idamWebUrl).hostname;
  const hasIdamSession = cookies.some((cookie) =>
    cookie.name === 'Idam.Session' &&
    isUnexpiredCookie(cookie) &&
    isCookieCompatibleWithHost(cookie.domain, idamHost)
  );
  const hasAoSession = cookies.some((cookie) =>
    cookie.name === 'ao-webapp' &&
    isUnexpiredCookie(cookie) &&
    isCookieCompatibleWithHost(cookie.domain, targetHost)
  );
  return hasIdamSession && hasAoSession;
}

function isSessionFresh(storageStatePath: string, targetUrl = config.baseUrl): boolean {
  if (!fs.existsSync(storageStatePath)) {
    return false;
  }

  const maxAgeMs = resolveSessionMaxAgeMs();
  const stats = fs.statSync(storageStatePath);
  if (Date.now() - stats.mtimeMs > maxAgeMs) {
    return false;
  }

  return hasUnexpiredAuthCookie(storageStatePath, targetUrl);
}

function storageStateFingerprint(serializedState: string): string {
  return createHash('sha256').update(serializedState).digest('hex');
}

function readStorageStateFingerprint(storageStatePath: string): string | undefined {
  try {
    return storageStateFingerprint(fs.readFileSync(storageStatePath, 'utf8'));
  } catch {
    return undefined;
  }
}

function isReusableSessionForCapture(
  storageStatePath: string,
  options: SessionCaptureOptions
): boolean {
  if (!isSessionFresh(storageStatePath)) {
    return false;
  }

  if (!options.force) {
    return true;
  }

  const expectedStaleSession = options.expectedStaleSession;
  const currentFingerprint = readStorageStateFingerprint(storageStatePath);
  return !!expectedStaleSession &&
    path.resolve(expectedStaleSession.storageStatePath) === path.resolve(storageStatePath) &&
    !!currentFingerprint &&
    currentFingerprint !== expectedStaleSession.storageStateFingerprint;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/([?&](?:token|access_token|id_token|password|secret)=)[^&#\s]*/gi, '$1[REDACTED]')
    .replace(/((?:password|token|secret)["'=:\s]+)[^,\s&}]+/gi, '$1[REDACTED]');
}

async function launchBrowserForSessionCapture(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true, channel: 'chrome', timeout: BROWSER_LAUNCH_TIMEOUT_MS });
  } catch {
    return chromium.launch({ headless: true, timeout: BROWSER_LAUNCH_TIMEOUT_MS });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SessionLockRelease = (() => Promise<void>) & { assertOwned: () => void };

type SessionLockRequest = {
  lockPath: string;
  userIdentifier: string;
  isSessionReusable: () => boolean;
};

function ensureLockTarget(lockPath: string): void {
  if (!fs.existsSync(lockPath)) {
    fs.writeFileSync(lockPath, '', 'utf8');
  }
}

function isLockAlreadyHeldError(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === 'ELOCKED';
}

async function acquireSessionCaptureLock({
  lockPath,
  userIdentifier,
  isSessionReusable
}: SessionLockRequest): Promise<SessionLockRelease | null> {
  ensureLockTarget(lockPath);
  const startTime = Date.now();

  while (Date.now() - startTime < SESSION_CAPTURE_LOCK_TIMEOUT_MS) {
    if (isSessionReusable()) {
      console.log(`[playwright-session] Fresh session appeared while waiting for ${userIdentifier} lock`);
      return null;
    }

    try {
      let compromisedError: Error | undefined;
      const releaseLock = await lockfile.lock(lockPath, {
        retries: 0,
        stale: SESSION_CAPTURE_LOCK_STALE_MS,
        update: SESSION_CAPTURE_LOCK_UPDATE_MS,
        onCompromised: (error) => {
          compromisedError = error;
        }
      });

      const assertOwned = (): void => {
        if (compromisedError) {
          throw new Error(`Session capture lock was compromised for ${userIdentifier}: ${compromisedError.message}`);
        }
      };
      const release = async (): Promise<void> => {
        assertOwned();
        await releaseLock();
        assertOwned();
      };
      return Object.assign(release, { assertOwned });
    } catch (error) {
      if (!isLockAlreadyHeldError(error)) {
        throw error;
      }

      await sleep(SESSION_CAPTURE_LOCK_RETRY_MS);
    }
  }

  throw new Error(`Timed out waiting for Playwright session capture lock for ${userIdentifier}: ${lockPath}`);
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

async function hasCapturedAuthenticatedSession(
  page: Page,
  context: Pick<BrowserContext, 'cookies'>,
  authTimeoutMs = AUTHENTICATION_TIMEOUT_MS
): Promise<boolean> {
  const deadline = Date.now() + authTimeoutMs;

  do {
    if ((await getAuthenticationState(page)).authenticated) {
      return true;
    }

    if (!(await isOnLoginOrCallbackSurface(page)) && hasPersistableSessionCookies(await context.cookies().catch(() => []))) {
      return true;
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }

    await sleep(Math.min(AUTHENTICATION_POLL_INTERVAL_MS, remainingMs));
  } while (Date.now() < deadline);

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
    `currentUrl=${redactSensitiveText(page.url())}`,
    `title=${pageTitle}`,
    `authStatus=${authState.status ?? 'unavailable'}`,
    `authBody=${redactSensitiveText(authState.body ?? authState.error ?? '<empty>')}`
  ];

  if (visibleErrorText) {
    context.push(`visibleError=${redactSensitiveText(visibleErrorText)}`);
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

function normaliseUrlPath(url: string): string {
  return new URL(url, config.baseUrl).pathname.replace(/\/$/, '') || '/';
}

async function hasExpectedAuthenticatedShell(page: Page, currentPath: string): Promise<boolean> {
  if (currentPath.startsWith('/organisation-details/')) {
    const hasApprovalHeading = await page
      .getByRole('heading', { name: 'Approve organisation', exact: true })
      .isVisible({ timeout: AUTHENTICATED_SURFACE_TIMEOUT_MS })
      .catch(() => false);
    return hasApprovalHeading || await page
      .getByRole('heading', { name: 'Organisation details', exact: true, level: 1 })
      .isVisible({ timeout: AUTHENTICATED_SURFACE_TIMEOUT_MS })
      .catch(() => false);
  }

  if (currentPath.startsWith('/organisation')) {
    return page
      .getByRole('heading', { name: 'Organisation approvals' })
      .isVisible({ timeout: AUTHENTICATED_SURFACE_TIMEOUT_MS })
      .catch(() => false);
  }

  if (currentPath.startsWith('/caseworker-details')) {
    return page
      .getByRole('heading', { name: 'Upload staff details' })
      .isVisible({ timeout: AUTHENTICATED_SURFACE_TIMEOUT_MS })
      .catch(() => false);
  }

  return false;
}

async function hasAuthenticatedAccountNavigation(page: Page): Promise<boolean> {
  return page.getByRole('link', { name: 'Sign out' }).isVisible().catch(() => false);
}

async function authenticatedPageContext(page: Page, navigationStatus?: number): Promise<string> {
  const route = normaliseUrlPath(page.url());
  const title = await page.title().catch(() => 'unavailable');
  const bodyLength = await page.locator('body').innerText().then((text) => text.trim().length).catch(() => 0);
  const authState = await getAuthenticationState(page);
  const onLoginSurface = await isOnLoginOrCallbackSurface(page);
  const hasExpectedShell = await hasExpectedAuthenticatedShell(page, route);
  const hasAccountNavigation = await hasAuthenticatedAccountNavigation(page);
  return `route=${route}, navigationStatus=${navigationStatus ?? 'unavailable'}, title=${JSON.stringify(title)}, bodyLength=${bodyLength}, auth=${authState.authenticated}, onLoginSurface=${onLoginSurface}, hasExpectedShell=${hasExpectedShell}, hasAccountNavigation=${hasAccountNavigation}`;
}

async function isExpectedAuthenticatedSurface(page: Page, destinationUrl: string): Promise<boolean> {
  const currentUrl = page.url();
  if (await isOnLoginOrCallbackSurface(page)) {
    return false;
  }

  const current = new URL(currentUrl, config.baseUrl);
  const destination = new URL(destinationUrl, config.baseUrl);
  const currentPath = normaliseUrlPath(currentUrl);
  const destinationPath = normaliseUrlPath(destinationUrl);
  const isExpectedDefaultRoute = DEFAULT_AUTHENTICATED_ROUTE_PATTERN.test(currentPath);
  if (
    current.origin !== destination.origin ||
    UNAVAILABLE_ROUTE_PATTERN.test(currentPath) ||
    (destinationPath === '/' ? !isExpectedDefaultRoute : currentPath !== destinationPath)
  ) {
    return false;
  }

  const bodyText = await page.locator('body').innerText().catch(() => '');
  if (bodyText.trim().length === 0 || !(await hasExpectedAuthenticatedShell(page, currentPath))) {
    return false;
  }

  return (await getAuthenticationState(page)).authenticated || await hasAuthenticatedAccountNavigation(page);
}

async function waitForExpectedAuthenticatedSurface(
  page: Page,
  destinationUrl: string,
  timeoutMs = AUTHENTICATED_SURFACE_TIMEOUT_MS
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  do {
    if (await isExpectedAuthenticatedSurface(page, destinationUrl)) {
      return true;
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      return false;
    }

    await page.waitForTimeout(Math.min(AUTHENTICATED_SURFACE_POLL_INTERVAL_MS, remainingMs));
  } while (Date.now() < deadline);

  return false;
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

async function completeLoginOnPage(
  page: Page,
  username: string,
  password: string,
  login: typeof completeIdamLogin = completeIdamLogin
): Promise<void> {
  await page.goto(authLoginUrl(), { waitUntil: 'domcontentloaded' });

  if (!(await isOnLoginOrCallbackSurface(page)) && await hasCapturedAuthenticatedSession(page, page.context(), 5_000)) {
    return;
  }

  const retryUntil = Date.now() + LOGIN_REDIRECT_TIMEOUT_MS;
  let attempt = 1;

  while (Date.now() < retryUntil) {
    if (attempt > 1) {
      await page.context().clearCookies();
      await page.goto(authLoginUrl(), { waitUntil: 'domcontentloaded' });
    }

    const isOnLoginSurface = await isOnLoginOrCallbackSurface(page);

    if (!isOnLoginSurface && await hasCapturedAuthenticatedSession(page, page.context(), 0)) {
      return;
    }

    if (isOnLoginSurface) {
      if (await isLoginInputVisible(page)) {
        await login(page, username, password);
        await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined);
        await waitForLoginRedirectToSettle(page, Math.max(AUTHENTICATION_POLL_INTERVAL_MS, retryUntil - Date.now()));
      } else {
        // The app gateway can briefly serve /auth/login without rendering IDAM inputs.
        const remainingMs = retryUntil - Date.now();
        await sleep(Math.min(500 * attempt, 5_000, Math.max(0, remainingMs)));
      }
    }

    const authCheckTimeout = Math.min(5_000, Math.max(0, retryUntil - Date.now()));
    if (
      authCheckTimeout > 0 &&
      await hasCapturedAuthenticatedSession(page, page.context(), authCheckTimeout)
    ) {
      return;
    }

    attempt += 1;
  }

  throw new Error(
    `Unable to authenticate "${username}" and capture Playwright session state. ${await loginFailureContext(page)}`
  );
}

async function persistSessionState(context: BrowserContext, storageStatePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  const temporaryPath = `${storageStatePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await context.storageState({ path: temporaryPath });
    fs.renameSync(temporaryPath, storageStatePath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

export async function sessionCapture(user: SessionIdentityInput = 'base', options: SessionCaptureOptions = {}): Promise<string> {
  const partitionKey = resolveSessionPartitionKey(options.partitionKey);
  const storageStatePath = getSessionStatePath(user, partitionKey);
  const lockPath = `${storageStatePath}.lock`;
  const failurePath = `${storageStatePath}.capture-failed.json`;
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  if (
    options.expectedStaleSession &&
    path.resolve(options.expectedStaleSession.storageStatePath) !== path.resolve(storageStatePath)
  ) {
    throw new Error(`Rejected session path does not match resolved session path for user "${resolveSessionIdentity(user).userIdentifier}".`);
  }

  if (isReusableSessionForCapture(storageStatePath, options)) {
    clearSessionCaptureFailure(failurePath);
    console.log(`[playwright-session] Reusing session: ${storageStatePath}`);
    return storageStatePath;
  }

  const recentFailureMessage = recentSessionCaptureFailureMessage(failurePath);
  if (recentFailureMessage) {
    throw new Error(
      `Recent session capture failed for user "${user}"; refusing repeated login attempt for now: ${recentFailureMessage}`
    );
  }

  const lock = await acquireSessionCaptureLock({
    lockPath,
    userIdentifier: resolveSessionIdentity(user).userIdentifier,
    isSessionReusable: () => isReusableSessionForCapture(storageStatePath, options)
  });
  if (!lock) {
    clearSessionCaptureFailure(failurePath);
    return storageStatePath;
  }

  try {
    if (isReusableSessionForCapture(storageStatePath, options)) {
      clearSessionCaptureFailure(failurePath);
      console.log(`[playwright-session] Reusing session: ${storageStatePath}`);
      return storageStatePath;
    }

    const lockedRecentFailureMessage = recentSessionCaptureFailureMessage(failurePath);
    if (lockedRecentFailureMessage) {
      throw new Error(
        `Recent session capture failed for user "${user}"; refusing repeated login attempt for now: ${lockedRecentFailureMessage}`
      );
    }

    const identity = resolveSessionIdentity(user);
    const partitionSuffix = partitionKey ? ` [${partitionKey}]` : '';
    console.log(`[playwright-session] Capturing session for ${identity.userIdentifier}${partitionSuffix} -> ${storageStatePath}`);
    let lastError: unknown;

    for (let attempt = 1; attempt <= SESSION_CAPTURE_ATTEMPTS; attempt += 1) {
      let browser: Browser | undefined;
      try {
        browser = await launchBrowserForSessionCapture();
        const context = await browser.newContext();
        const page = await context.newPage();

        await completeLoginOnPage(page, identity.email, identity.password);
        const authenticated = await hasCapturedAuthenticatedSession(page, context);
        if (!authenticated) {
          throw new Error(
            `Session capture did not create an authenticated session for "${identity.userIdentifier}". ${await loginFailureContext(page)}`
          );
        }
        lock.assertOwned();
        await persistSessionState(context, storageStatePath);
        lock.assertOwned();
        clearSessionCaptureFailure(failurePath);
        return storageStatePath;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (!isRetryableSessionCaptureFailure(message) || attempt === SESSION_CAPTURE_ATTEMPTS) {
          writeSessionCaptureFailure(failurePath, error);
          throw error;
        }
        console.warn(
          `[playwright-session] Transient capture failure for ${identity.userIdentifier}; retrying once (${attempt}/${SESSION_CAPTURE_ATTEMPTS}): ${redactSensitiveText(message)}`
        );
      } finally {
        await browser?.close();
      }
    }

    writeSessionCaptureFailure(failurePath, lastError);
    throw lastError;
  } finally {
    await lock();
  }
}

export async function applySessionCookies(
  page: Page,
  user: SessionIdentityInput = 'base',
  options: SessionCaptureOptions = {}
): Promise<RejectedSession> {
  const loadSessionState = (storageStatePath: string): RejectedSession & { cookies: StorageCookie[] } => {
    const serializedState = fs.readFileSync(storageStatePath, 'utf8');
    const state = JSON.parse(serializedState) as { cookies?: StorageCookie[] };
    return {
      storageStatePath,
      storageStateFingerprint: storageStateFingerprint(serializedState),
      cookies: state.cookies ?? []
    };
  };

  const storageStatePath = await sessionCapture(user, options);
  const state = loadSessionState(storageStatePath);
  if (state.cookies.length > 0) {
    await page.context().addCookies(state.cookies);
  }
  return state;
}

export async function ensureAuthenticatedPageAt(
  page: Page,
  destinationUrl: string,
  user: SessionIdentityInput = 'base',
  options: SessionCaptureOptions = {}
): Promise<void> {
  let lastNavigationStatus: number | undefined;
  const gotoAndVerify = async (): Promise<boolean> => {
    const response = await page.goto(destinationUrl, { waitUntil: 'domcontentloaded' });
    lastNavigationStatus = response?.status();
    return waitForExpectedAuthenticatedSurface(page, destinationUrl);
  };

  const rejectedSession = await applySessionCookies(page, user, options);
  if (await gotoAndVerify()) {
    return;
  }

  await sessionCapture(user, {
    ...options,
    force: true,
    expectedStaleSession: rejectedSession
  });
  await applySessionCookies(page, user, options);
  if (await gotoAndVerify()) {
    return;
  }

  await sessionCapture(user, { ...options, force: true });
  await applySessionCookies(page, user, options);
  if (await gotoAndVerify()) {
    return;
  }

  const identity = resolveSessionIdentity(user);
  throw new Error(
    `Unable to ensure authenticated page for user "${identity.userIdentifier}". ${await authenticatedPageContext(page, lastNavigationStatus)}`
  );
}

export async function ensureAuthenticatedPage(page: Page, user: SessionIdentityInput = 'base', options: SessionCaptureOptions = {}): Promise<void> {
  await ensureAuthenticatedPageAt(page, config.baseUrl, user, options);
}

export const __test__ = {
  normaliseSessionStorageKey,
  getSessionStatePath,
  resolveSessionIdentity,
  resolveSessionPartitionKey,
  redactSensitiveText,
  loginFailureContext,
  hasUnexpiredAuthCookie,
  hasPersistableSessionCookies,
  hasCapturedAuthenticatedSession,
  completeLoginOnPage,
  isSessionFresh,
  readStorageStateFingerprint,
  isReusableSessionForCapture,
  isExpectedAuthenticatedSurface,
  waitForExpectedAuthenticatedSurface,
  hasExpectedAuthenticatedShell,
  hasAuthenticatedAccountNavigation,
  acquireSessionCaptureLock,
  persistSessionState,
  sessionCapture,
  SESSION_CAPTURE_LOCK_STALE_MS,
  SESSION_CAPTURE_LOCK_TIMEOUT_MS,
  SESSION_CAPTURE_LOCK_UPDATE_MS,
  SESSION_CAPTURE_ATTEMPT_BUDGET_MS,
  SESSION_CAPTURE_ATTEMPTS,
  isRetryableSessionCaptureFailure
};

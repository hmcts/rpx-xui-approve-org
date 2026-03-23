import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as lockfile from 'proper-lockfile';
import type { Cookie } from 'playwright-core';
import { getAppBaseUrl, getAppConfig } from '../E2E/utils/test-setup/appConfig';
import { signIn } from '../E2E/utils/test-setup/auth';
import { createLogger } from '@hmcts/playwright-common';
import { consumeAuthRecoveryEvents, type AuthRecoveryEvent } from './authRecovery';

const SESSION_DIR = path.join(process.cwd(), '.sessions');
const DEFAULT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SESSION_LOCK_WAIT_MS = 90_000;
const SESSION_LOCK_POLL_INTERVAL_MS = 1_000;
const SESSION_RECOVERY_SUFFIX = '.recovery.json';
const PRIMARY_AUTH_COOKIE_NAMES = ['ao-webapp', '__auth__'] as const;
const DIAGNOSTIC_AUTH_COOKIE_NAMES = ['Idam.Session'] as const;
const logger = createLogger({
  serviceName: 'approve-org-session-capture',
  format: process.env.CI ? 'json' : 'pretty',
  level: process.env.LOG_LEVEL ?? 'info',
  enableRedaction: true,
});

function resolveSessionStorageKey(): string {
  return (
    getAppConfig()
      .username.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ao-admin'
  );
}

function resolveSessionPath(): string {
  return path.join(SESSION_DIR, `${resolveSessionStorageKey()}.storage.json`);
}

function shouldRunSessionCaptureHeaded(env: NodeJS.ProcessEnv = process.env): boolean {
  const args = process.argv;
  return (
    env.PW_SESSION_HEADED === 'true' ||
    env.HEAD === 'true' ||
    env.PWDEBUG === '1' ||
    args.includes('--headed') ||
    args.includes('--debug')
  );
}

function resolveSessionMaxAgeMs(env: NodeJS.ProcessEnv = process.env): number {
  const configured = Number(env.PW_SESSION_MAX_AGE_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_MAX_AGE_MS;
}

function normalizeCookieDomain(domain: string | undefined): string | null {
  const value = domain?.trim().replace(/^\./, '');
  return value ? value.toLowerCase() : null;
}

function resolveTargetHost(targetUrl: string): string | null {
  try {
    return new URL(targetUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isCookieUsable(cookie: Cookie): boolean {
  if (typeof cookie.expires !== 'number' || cookie.expires <= 0) {
    return true;
  }

  return cookie.expires > Math.floor(Date.now() / 1000) + 60;
}

function isCookieCompatibleWithTarget(cookie: Cookie, targetUrl: string): boolean {
  const targetHost = resolveTargetHost(targetUrl);
  if (!targetHost) {
    return true;
  }

  const cookieDomain = normalizeCookieDomain(cookie.domain);
  if (!cookieDomain) {
    return false;
  }

  return targetHost === cookieDomain || targetHost.endsWith(`.${cookieDomain}`) || cookieDomain.endsWith(`.${targetHost}`);
}

function hasCompatiblePrimaryAuthCookie(cookies: Cookie[], targetUrl: string): boolean {
  return cookies.some(
    (cookie) =>
      PRIMARY_AUTH_COOKIE_NAMES.includes(cookie.name as (typeof PRIMARY_AUTH_COOKIE_NAMES)[number]) &&
      isCookieCompatibleWithTarget(cookie, targetUrl) &&
      isCookieUsable(cookie)
  );
}

function hasDiagnosticAuthCookie(cookies: Cookie[]): boolean {
  return cookies.some(
    (cookie) =>
      DIAGNOSTIC_AUTH_COOKIE_NAMES.includes(cookie.name as (typeof DIAGNOSTIC_AUTH_COOKIE_NAMES)[number]) &&
      isCookieUsable(cookie)
  );
}

function hasCompatibleAuthCookie(cookies: Cookie[], targetUrl: string): boolean {
  return hasCompatiblePrimaryAuthCookie(cookies, targetUrl);
}

async function waitForCompatibleAuthCookies(
  context: Pick<
    ReturnType<(typeof chromium)['launch']> extends Promise<infer B>
      ? B['newContext'] extends (...args: any[]) => Promise<infer C>
        ? C
        : never
      : never,
    'cookies'
  >,
  targetUrl: string,
  timeoutMs: number = 15_000
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const cookies = await context.cookies().catch(() => []);
    if (hasCompatibleAuthCookie(cookies as Cookie[], targetUrl)) {
      return true;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, Math.min(500, deadline - Date.now())));
  }

  return false;
}

function ensureSessionLockFile(sessionPath: string): string {
  const lockPath = `${sessionPath}.lock`;
  if (!fs.existsSync(lockPath)) {
    fs.writeFileSync(lockPath, '', 'utf8');
  }

  return lockPath;
}

function resolveSessionRecoveryPath(sessionPath: string): string {
  return `${sessionPath}${SESSION_RECOVERY_SUFFIX}`;
}

function writeSessionRecoveryEvents(sessionPath: string, events: AuthRecoveryEvent[]) {
  const recoveryPath = resolveSessionRecoveryPath(sessionPath);

  if (events.length === 0) {
    if (fs.existsSync(recoveryPath)) {
      fs.unlinkSync(recoveryPath);
    }
    return;
  }

  fs.writeFileSync(
    recoveryPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        events,
      },
      null,
      2
    ),
    'utf8'
  );
}

function deleteSessionState(sessionPath: string) {
  try {
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
    const recoveryPath = resolveSessionRecoveryPath(sessionPath);
    if (fs.existsSync(recoveryPath)) {
      fs.unlinkSync(recoveryPath);
    }
  } catch {
    logger.warn('Best-effort cleanup of stale or partial session state failed', { sessionPath });
  }
}

export function getSessionStatePath(): string {
  return resolveSessionPath();
}

export function isSessionFresh(sessionPath: string = resolveSessionPath(), targetUrl: string = getAppBaseUrl()): boolean {
  try {
    if (!fs.existsSync(sessionPath)) {
      return false;
    }

    const stat = fs.statSync(sessionPath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs >= resolveSessionMaxAgeMs()) {
      return false;
    }

    const state = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    const cookies = Array.isArray(state.cookies) ? (state.cookies as Cookie[]) : [];
    if (cookies.length === 0) {
      return false;
    }

    return hasCompatibleAuthCookie(cookies, targetUrl);
  } catch {
    return false;
  }
}

export function readSessionRecoveryEvents(sessionPath: string = resolveSessionPath()): AuthRecoveryEvent[] {
  try {
    const recoveryPath = resolveSessionRecoveryPath(sessionPath);
    if (!fs.existsSync(recoveryPath)) {
      return [];
    }

    const raw = JSON.parse(fs.readFileSync(recoveryPath, 'utf8'));
    return Array.isArray(raw.events) ? (raw.events as AuthRecoveryEvent[]) : [];
  } catch {
    return [];
  }
}

export async function captureSession(): Promise<string> {
  const sessionPath = resolveSessionPath();
  const headed = shouldRunSessionCaptureHeaded();
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  logger.info('Capturing fresh Playwright session state', { sessionPath, headed });

  const browser = await chromium.launch({ headless: !headed, slowMo: headed ? 250 : 0 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await signIn(page);
    const recoveryEvents = consumeAuthRecoveryEvents(page);
    const hasPersistableCookies = await waitForCompatibleAuthCookies(context, getAppBaseUrl());
    const cookies = await context.cookies().catch(() => []);
    if (!hasPersistableCookies || !hasCompatibleAuthCookie(cookies, getAppBaseUrl())) {
      deleteSessionState(sessionPath);
      logger.error('Authenticated AO session cookies were not persisted after sign-in', {
        sessionPath,
        cookieNames: cookies.map((cookie) => cookie.name),
      });
      throw new Error('Authenticated app session cookies were not persisted after sign-in');
    }
    if (!hasDiagnosticAuthCookie(cookies)) {
      logger.warn('AO session capture persisted without IdAM session cookies; continuing with app-session cookies only.', {
        sessionPath,
      });
    }
    await context.storageState({ path: sessionPath });
    writeSessionRecoveryEvents(sessionPath, recoveryEvents);
    logger.info('Persisted Playwright storage state', { sessionPath });
    return sessionPath;
  } finally {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

export async function ensureSession(): Promise<string> {
  const sessionPath = resolveSessionPath();

  if (isSessionFresh()) {
    logger.debug('Reusing fresh Playwright session state', { sessionPath });
    return sessionPath;
  }

  fs.mkdirSync(SESSION_DIR, { recursive: true });
  const release = await lockfile.lock(ensureSessionLockFile(sessionPath), {
    realpath: false,
    retries: {
      retries: Math.ceil(SESSION_LOCK_WAIT_MS / SESSION_LOCK_POLL_INTERVAL_MS),
      factor: 1,
      minTimeout: SESSION_LOCK_POLL_INTERVAL_MS,
      maxTimeout: SESSION_LOCK_POLL_INTERVAL_MS,
    },
  });

  try {
    if (isSessionFresh()) {
      logger.debug('Reusing Playwright session state after lock acquisition', { sessionPath });
      return sessionPath;
    }

    deleteSessionState(sessionPath);
    logger.info('Existing Playwright session state is stale; recapturing', { sessionPath });
    return captureSession();
  } finally {
    await release();
  }
}

export const __test__ = {
  hasCompatiblePrimaryAuthCookie,
  hasDiagnosticAuthCookie,
  hasCompatibleAuthCookie,
  isCookieCompatibleWithTarget,
  isCookieUsable,
};

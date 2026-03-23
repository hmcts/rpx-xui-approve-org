import type { Locator, Page } from '@playwright/test';
import { IdamPage } from '@hmcts/playwright-common';
import { getAppConfig } from './appConfig';
import { logger } from '../logger.utils';
import { recordAuthRecoveryEvent } from '../../../common/authRecovery';
import {
  AUTH_POLL_INTERVAL_MS,
  createInitialAuthLoopCounters,
  getAuthLoopAction,
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_TIMEOUT_MS,
  type AuthLoopMode,
  type AuthObservedState,
  type AuthState
} from '../../../common/authFlow';
import { recoverCallbackError, recoverServerError } from '../../../common/authRecoveryFlow';

const IDAM_USERNAME_FALLBACK_SELECTOR =
  'input#email, input[name="email"], input[name="emailAddress"], input[autocomplete="email"]';
const IDAM_PASSWORD_FALLBACK_SELECTOR = 'input#password, input[name="password"], input[type="password"]';
const IDAM_SUBMIT_FALLBACK_SELECTOR = 'button:has-text("Sign in"), button:has-text("Continue")';
const ACCEPT_COOKIES_BUTTON_TEXT = 'Accept additional cookies';
const REJECT_COOKIES_BUTTON_TEXT = 'Reject additional cookies';
const IMMEDIATE_SERVER_ERROR_REFRESH_ATTEMPTS = 3;

async function isVisible(locator: Locator) {
  return locator.isVisible().catch(() => false);
}

function getFirstVisibleLocatorFallback(page: Page, primary: Locator, fallbackSelector: string) {
  return (async () => {
    if (await isVisible(primary.first())) {
      return primary.first();
    }

    return page.locator(fallbackSelector).first();
  })();
}

async function isInternalServerErrorPage(page: Page) {
  const errorTextVisible = await isVisible(page.getByText(/internal server error/i));
  if (errorTextVisible) {
    return true;
  }

  const title = await page.title().catch(() => '');
  if (/^error$/i.test(title.trim())) {
    return true;
  }

  const bodyText = await page
    .locator('body')
    .innerText()
    .catch(() => '');

  return /internal server error/i.test(bodyText);
}

async function isCallbackServerError(page: Page) {
  return page.url().includes('/oauth2/callback') && (await isInternalServerErrorPage(page));
}

async function isIdamLoginVisible(page: Page) {
  const usernameInput = await getFirstVisibleLocatorFallback(
    page,
    new IdamPage(page).usernameInput,
    IDAM_USERNAME_FALLBACK_SELECTOR
  );
  return isVisible(usernameInput);
}

async function waitForNextAuthPoll(page: Page) {
  await page.waitForTimeout(AUTH_POLL_INTERVAL_MS);
}

async function dismissIdamCookieBanner(page: Page) {
  const acceptButton = page.getByRole('button', { name: ACCEPT_COOKIES_BUTTON_TEXT, exact: true });
  const rejectButton = page.getByRole('button', { name: REJECT_COOKIES_BUTTON_TEXT, exact: true });

  if (await isVisible(acceptButton)) {
    logger.info('Dismissing IdAM cookie banner', {
      action: 'accept',
      url: page.url()
    });
    recordAuthRecoveryEvent(page, {
      kind: 'cookie-banner',
      context: 'idam-cookie-banner',
      url: page.url(),
      detail: 'Accepted additional cookies'
    });
    await acceptButton.click();
    await acceptButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
    return;
  }

  if (await isVisible(rejectButton)) {
    logger.info('Dismissing IdAM cookie banner', {
      action: 'reject',
      url: page.url()
    });
    recordAuthRecoveryEvent(page, {
      kind: 'cookie-banner',
      context: 'idam-cookie-banner',
      url: page.url(),
      detail: 'Rejected additional cookies'
    });
    await rejectButton.click();
    await rejectButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
  }
}

async function settleInteractiveAuthState(page: Page) {
  await dismissIdamCookieBanner(page);
}

async function reopenAoRoot(page: Page, context: string, refreshCount: number) {
  const { baseUrl } = getAppConfig();

  logger.warn('Server error persisted; reopening AO root in a fresh page navigation cycle', {
    context,
    refreshCount,
    url: page.url(),
    baseUrl
  });
  recordAuthRecoveryEvent(page, {
    kind: 'ao-server-error',
    context,
    url: page.url(),
    detail: `Reopening ${baseUrl} after persistent server error`
  });

  await page.goto('about:blank', { waitUntil: 'load' }).catch(() => undefined);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await waitForNextAuthPoll(page);
}

async function recoverTransientServerError(page: Page, context: string, refreshCount: number) {
  logger.warn('Transient AO server error detected; refreshing browser', {
    context,
    refreshCount,
    url: page.url()
  });
  recordAuthRecoveryEvent(page, {
    kind: 'ao-server-error',
    context,
    url: page.url(),
    detail: `Attempting browser reload after server error ${refreshCount}`
  });

  await recoverServerError(
    {
      isErrorPage: () => isInternalServerErrorPage(page),
      reload: () => page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined),
      waitFor: (ms) => page.waitForTimeout(ms),
      gotoRoot: async () => {
        const { baseUrl } = getAppConfig();
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
      },
      reopenRoot: () => reopenAoRoot(page, context, refreshCount)
    },
    {
      immediateRefreshAttempts: IMMEDIATE_SERVER_ERROR_REFRESH_ATTEMPTS,
      shortWaitMs: AUTH_POLL_INTERVAL_MS
    },
    {
      onImmediateRefresh: async (attempt) => {
        logger.warn('AO is still on a plain server error page; forcing an immediate browser refresh', {
          context,
          refreshCount,
          attempt,
          url: page.url()
        });
        recordAuthRecoveryEvent(page, {
          kind: 'ao-server-error',
          context,
          url: page.url(),
          detail: `Immediate server-error refresh ${attempt}/${IMMEDIATE_SERVER_ERROR_REFRESH_ATTEMPTS}`
        });
      },
      onReload: async () => {
        logger.warn('AO error persisted after immediate refreshes; retrying with a full browser reload', {
          context,
          refreshCount,
          url: page.url()
        });
      },
      onGotoRoot: async () => {
        const { baseUrl } = getAppConfig();
        logger.warn('Server error persisted after browser reload; navigating back to AO root', {
          context,
          refreshCount,
          url: page.url()
        });
        recordAuthRecoveryEvent(page, {
          kind: 'ao-server-error',
          context,
          url: page.url(),
          detail: `Reload did not recover; navigating to ${baseUrl}`
        });
      }
    }
  );
}

async function observeAuthState(page: Page): Promise<AuthObservedState> {
  const organisationApprovalsHeading = page.getByRole('heading', { name: 'Organisation approvals' });

  if (await isVisible(organisationApprovalsHeading)) {
    return 'signed-in';
  }

  await settleInteractiveAuthState(page);

  if (await isVisible(organisationApprovalsHeading)) {
    return 'signed-in';
  }

  if (await isCallbackServerError(page)) {
    return 'callback-server-error';
  }

  if (await isInternalServerErrorPage(page)) {
    return 'server-error';
  }

  if (await isIdamLoginVisible(page)) {
    return 'login-visible';
  }

  return 'pending';
}

async function resolveAuthState(page: Page, mode: AuthLoopMode): Promise<AuthState> {
  const deadline = Date.now() + LOGIN_TIMEOUT_MS;
  let counters = createInitialAuthLoopCounters();

  while (Date.now() < deadline) {
    const observedState = await observeAuthState(page);
    const action = getAuthLoopAction(mode, observedState, counters);

    if (action.kind === 'return') {
      return action.state;
    }

    if (action.kind === 'timed-out') {
      break;
    }

    if (action.kind === 'refresh') {
      counters = action.counters;
      if (action.reason === 'callback') {
        logger.warn('Transient callback error detected during AO login; refreshing browser', {
          refreshCount: counters.callbackRefreshCount,
          url: page.url()
        });
        recordAuthRecoveryEvent(page, {
          kind: 'callback-server-error',
          context: mode,
          url: page.url(),
          detail: `Callback refresh ${counters.callbackRefreshCount}`
        });
        await recoverCallbackError(
          {
            gotoRoot: () => page.goto(getAppConfig().baseUrl, { waitUntil: 'domcontentloaded' }),
            waitFor: (ms) => page.waitForTimeout(ms)
          },
          AUTH_POLL_INTERVAL_MS
        );
      } else {
        await recoverTransientServerError(page, mode, counters.serverErrorRefreshCount);
      }
      continue;
    }

    await waitForNextAuthPoll(page);
  }

  return 'timed-out';
}

export async function openStableLoginPage(page: Page) {
  const { baseUrl } = getAppConfig();

  logger.info('Opening AO login page', {
    baseUrl
  });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  const authState = await resolveAuthState(page, 'allow-login');
  if (authState === 'login-visible') {
    await settleInteractiveAuthState(page);
    return;
  }

  if (authState === 'signed-in') {
    throw new Error('Expected the IdAM login page but an authenticated AO session was already active');
  }

  throw new Error('AO login page did not stabilise after recovery attempts');
}

export async function signIn(page: Page) {
  const { baseUrl, username, password } = getAppConfig();
  const idamPage = new IdamPage(page);

  logger.info('Signing in to AO', { baseUrl, username });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const initialState = await resolveAuthState(page, 'allow-login');
  if (initialState === 'signed-in') {
    logger.info('Reused existing authenticated AO session', { username });
    return;
  }

  for (let attempt = 0; attempt < LOGIN_ATTEMPT_LIMIT; attempt++) {
    try {
      if (attempt > 0) {
        logger.info('Resetting AO auth flow before retry', {
          attempt: attempt + 1,
          username,
          baseUrl
        });
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      }

      const authState = attempt === 0 ? initialState : await resolveAuthState(page, 'allow-login');
      if (authState === 'signed-in') {
        logger.info('Reused existing authenticated AO session', { username, attempt: attempt + 1 });
        return;
      }
      if (authState !== 'login-visible') {
        throw new Error(`AO login page did not stabilise before login attempt ${attempt + 1}`);
      }

      await settleInteractiveAuthState(page);

      const usernameInput = await getFirstVisibleLocatorFallback(page, idamPage.usernameInput, IDAM_USERNAME_FALLBACK_SELECTOR);
      const passwordInput = await getFirstVisibleLocatorFallback(page, idamPage.passwordInput, IDAM_PASSWORD_FALLBACK_SELECTOR);
      const submitButton = await getFirstVisibleLocatorFallback(page, idamPage.submitBtn, IDAM_SUBMIT_FALLBACK_SELECTOR);

      await usernameInput.waitFor({ state: 'visible', timeout: 10_000 });
      await usernameInput.fill(username);
      await passwordInput.fill(password);
      await submitButton.click();

      if ((await resolveAuthState(page, 'require-signed-in')) === 'signed-in') {
        logger.info('Signed in to AO', { username, attempt: attempt + 1 });
        return;
      }

      logger.warn('Login attempt did not reach Organisation approvals, retrying', {
        attempt: attempt + 1,
        username,
        currentUrl: page.url()
      });
      recordAuthRecoveryEvent(page, {
        kind: 'login-retry',
        context: 'post-submit',
        url: page.url(),
        detail: `Attempt ${attempt + 1} did not reach Organisation approvals`
      });

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    } catch (error) {
      logger.warn('Login attempt failed', {
        attempt: attempt + 1,
        username,
        currentUrl: page.url(),
        error: error instanceof Error ? error.message : String(error)
      });
      recordAuthRecoveryEvent(page, {
        kind: 'login-retry',
        context: 'login-attempt-failed',
        url: page.url(),
        detail: error instanceof Error ? error.message : String(error)
      });

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }
  }

  throw new Error(`Login failed after ${LOGIN_ATTEMPT_LIMIT} attempts.`);
}

import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { config } from '../../config/config';
import { sessionCapture } from '../../helpers/sessionCapture';

const authSessionUser = (process.env.PW_AUTH_SESSION_USER ?? 'base').trim() || 'base';
const authSessionPartitionKey = 'api';
const CSRF_BOOTSTRAP_ATTEMPTS = 2;
const CSRF_BOOTSTRAP_RETRY_DELAY_MS = 250;
const TRANSIENT_CSRF_BOOTSTRAP_ERROR_PATTERN = /\b(aborted|econnreset|etimedout|socket hang up|fetch failed)\b/i;

type CsrfBootstrapContext = Pick<APIRequestContext, 'get' | 'storageState'>;

type CsrfBootstrapResult = {
  storageState: Awaited<ReturnType<APIRequestContext['storageState']>>;
  xsrfToken: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientCsrfBootstrapError(error: unknown): boolean {
  return error instanceof Error && TRANSIENT_CSRF_BOOTSTRAP_ERROR_PATTERN.test(error.message);
}

function cookieMatchesHost(cookieDomain: string | undefined, hostName: string): boolean {
  if (!cookieDomain) {
    return false;
  }

  const normalizedDomain = cookieDomain.replace(/^\./, '').toLowerCase();
  const normalizedHost = hostName.toLowerCase();

  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

export async function isAuthenticatedRequestContext(requestContext: APIRequestContext): Promise<boolean> {
  try {
    const response = await requestContext.get('auth/isAuthenticated', { failOnStatusCode: false });
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

export async function bootstrapCsrfStorageState(
  requestContext: CsrfBootstrapContext,
  attempts = CSRF_BOOTSTRAP_ATTEMPTS,
  retryDelayMs = CSRF_BOOTSTRAP_RETRY_DELAY_MS
): Promise<CsrfBootstrapResult> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const environmentResponse = await requestContext.get('/api/environment', { failOnStatusCode: false });
      const apiHostName = new URL(environmentResponse.url()).hostname;
      const storageState = await requestContext.storageState();
      const xsrfCookies = storageState.cookies.filter((cookie) => cookie.name === 'XSRF-TOKEN');
      const xsrfToken = xsrfCookies.find((cookie) => cookieMatchesHost(cookie.domain, apiHostName))?.value;

      if (!xsrfToken) {
        throw new Error(`Unable to resolve XSRF token for authenticated API request context for user "${authSessionUser}".`);
      }

      return { storageState, xsrfToken };
    } catch (error) {
      lastError = error;
      if (!isTransientCsrfBootstrapError(error) || attempt === attempts) {
        throw error;
      }

      await sleep(retryDelayMs * attempt);
    }
  }

  throw lastError;
}

export async function createAuthenticatedApiContext(forceRefresh = false): Promise<APIRequestContext> {
  const storageStatePath = await sessionCapture(authSessionUser, {
    force: forceRefresh,
    partitionKey: authSessionPartitionKey
  });
  const csrfBootstrapContext = await playwrightRequest.newContext({
    baseURL: config.baseUrl,
    ignoreHTTPSErrors: true,
    storageState: storageStatePath
  });

  try {
    const { storageState, xsrfToken } = await bootstrapCsrfStorageState(csrfBootstrapContext);

    return playwrightRequest.newContext({
      baseURL: config.baseUrl,
      ignoreHTTPSErrors: true,
      storageState,
      extraHTTPHeaders: {
        'X-XSRF-TOKEN': xsrfToken
      }
    });
  } finally {
    await csrfBootstrapContext.dispose();
  }
}

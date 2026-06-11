import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { config } from '../../config/config';
import { sessionCapture } from '../../helpers/sessionCapture';

type AuthRequestFixtures = {
  authenticatedRequest: APIRequestContext;
  anonymousRequest: APIRequestContext;
};

const authSessionUser = (process.env.PW_AUTH_SESSION_USER ?? 'base').trim() || 'base';

function cookieMatchesHost(cookieDomain: string | undefined, hostName: string): boolean {
  if (!cookieDomain) {
    return false;
  }

  const normalizedDomain = cookieDomain.replace(/^\./, '').toLowerCase();
  const normalizedHost = hostName.toLowerCase();

  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

async function isAuthenticatedRequestContext(requestContext: APIRequestContext): Promise<boolean> {
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

async function createAuthenticatedApiContext(forceRefresh = false): Promise<APIRequestContext> {
  const storageStatePath = await sessionCapture(authSessionUser, { force: forceRefresh });
  const csrfBootstrapContext = await playwrightRequest.newContext({
    baseURL: config.baseUrl,
    ignoreHTTPSErrors: true,
    storageState: storageStatePath
  });

  try {
    const environmentResponse = await csrfBootstrapContext.get('/api/environment', { failOnStatusCode: false });
    const apiHostName = new URL(environmentResponse.url()).hostname;
    const csrfStorageState = await csrfBootstrapContext.storageState();
    const xsrfCookies = csrfStorageState.cookies.filter((cookie) => cookie.name === 'XSRF-TOKEN');
    const xsrfToken = xsrfCookies.find((cookie) => cookieMatchesHost(cookie.domain, apiHostName))?.value;

    if (!xsrfToken) {
      throw new Error(`Unable to resolve XSRF token for authenticated API request context for user "${authSessionUser}".`);
    }

    return playwrightRequest.newContext({
      baseURL: config.baseUrl,
      ignoreHTTPSErrors: true,
      storageState: csrfStorageState,
      extraHTTPHeaders: {
        'X-XSRF-TOKEN': xsrfToken
      }
    });
  } finally {
    await csrfBootstrapContext.dispose();
  }
}

export const authRequestTest = base.extend<AuthRequestFixtures>({
  authenticatedRequest: [
    async ({ baseURL: _baseURL }, use) => {
      void _baseURL;
      let requestContext = await createAuthenticatedApiContext(false);
      let authenticated = await isAuthenticatedRequestContext(requestContext);

      if (!authenticated) {
        await requestContext.dispose();
        requestContext = await createAuthenticatedApiContext(true);
        authenticated = await isAuthenticatedRequestContext(requestContext);
      }

      if (!authenticated) {
        await requestContext.dispose();
        throw new Error(
          `Unable to create an authenticated API request context for user "${authSessionUser}".`
        );
      }

      await use(requestContext);
      await requestContext.dispose();
    },
    { scope: 'test' }
  ],

  anonymousRequest: [
    async ({ baseURL: _baseURL }, use) => {
      void _baseURL;
      const requestContext = await playwrightRequest.newContext({
        baseURL: config.baseUrl,
        ignoreHTTPSErrors: true
      });

      await use(requestContext);
      await requestContext.dispose();
    },
    { scope: 'test' }
  ]
});

export { expect } from '@playwright/test';

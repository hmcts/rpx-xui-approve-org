import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { config } from '../../config/config';
import { sessionCapture } from '../../helpers/sessionCapture';

type ApiFixtures = {
  apiRequest: APIRequestContext;
  apiAnonymousRequest: APIRequestContext;
};

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
  const storageStatePath = await sessionCapture('base', { force: forceRefresh });
  return playwrightRequest.newContext({
    baseURL: config.baseUrl,
    ignoreHTTPSErrors: true,
    storageState: storageStatePath
  });
}

export const test = base.extend<ApiFixtures>({
  apiRequest: [
    async ({ baseURL: _baseURL }, use) => {
      void _baseURL;
      let requestContext = await createAuthenticatedApiContext(false);
      const authenticated = await isAuthenticatedRequestContext(requestContext);
      if (!authenticated) {
        await requestContext.dispose();
        requestContext = await createAuthenticatedApiContext(true);
      }

      await use(requestContext);
      await requestContext.dispose();
    },
    { scope: 'test' }
  ],

  apiAnonymousRequest: [
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

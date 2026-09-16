import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { createAuthenticatedApiContext, isAuthenticatedRequestContext } from '../../api/helpers/authenticated-api-request';
import { config } from '../../config/config';

type AuthRequestFixtures = {
  authenticatedRequest: APIRequestContext;
  anonymousRequest: APIRequestContext;
};

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
          `Unable to create an authenticated API request context for user "${process.env.PW_AUTH_SESSION_USER ?? 'base'}".`
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

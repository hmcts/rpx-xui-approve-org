import type { APIRequestContext } from '@playwright/test';
import { authRequestTest, expect } from '../../framework/fixtures/auth-request.fixtures';

type IntegrationFixtures = {
  integrationRequest: APIRequestContext;
  integrationAnonymousRequest: APIRequestContext;
};

export const test = authRequestTest.extend<IntegrationFixtures>({
  integrationRequest: async ({ authenticatedRequest }, use) => {
    await use(authenticatedRequest);
  },

  integrationAnonymousRequest: async ({ anonymousRequest }, use) => {
    await use(anonymousRequest);
  }
});

export { expect };

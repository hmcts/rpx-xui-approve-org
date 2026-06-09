import type { APIRequestContext } from '@playwright/test';
import { authRequestTest, expect } from '../../framework/fixtures/auth-request.fixtures';

type ApiFixtures = {
  apiRequest: APIRequestContext;
  apiAnonymousRequest: APIRequestContext;
};
export const test = authRequestTest.extend<ApiFixtures>({
  apiRequest: async ({ authenticatedRequest }, use) => {
    await use(authenticatedRequest);
  },

  apiAnonymousRequest: async ({ anonymousRequest }, use) => {
    await use(anonymousRequest);
  }
});

export { expect };

import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { config } from '../../config/config';
import { sessionCapture } from '../../helpers/sessionCapture';

type ApiFixtures = {
  apiRequest: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  apiRequest: [async ({ browserName }, use) => {
    void browserName;
    const storageStatePath = await sessionCapture('base');
    const requestContext = await playwrightRequest.newContext({
      baseURL: config.baseUrl,
      ignoreHTTPSErrors: true,
      storageState: storageStatePath
    });

    await use(requestContext);
    await requestContext.dispose();
  }, { scope: 'worker' }]
});

export { expect } from '@playwright/test';

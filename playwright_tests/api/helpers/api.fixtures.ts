import { request as playwrightRequest, test as base, type APIRequestContext } from '@playwright/test';
import { config } from '../../config/config';
import { getSessionStatePath, sessionCapture } from '../../helpers/sessionCapture';

type ApiFixtures = {
  apiRequest: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  apiRequest: [async ({ browserName }, use) => {
    void browserName;
    await sessionCapture('base');
    const requestContext = await playwrightRequest.newContext({
      baseURL: config.baseUrl,
      ignoreHTTPSErrors: true,
      storageState: getSessionStatePath('base')
    });

    await use(requestContext);
    await requestContext.dispose();
  }, { scope: 'worker' }]
});

export { expect } from '@playwright/test';

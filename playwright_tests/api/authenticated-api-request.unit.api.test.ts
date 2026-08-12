import { expect, test } from '@playwright/test';
import { bootstrapCsrfStorageState } from './helpers/authenticated-api-request';

const storageState = {
  cookies: [
    {
      name: 'XSRF-TOKEN',
      value: 'redacted-token',
      domain: 'approve-org.test'
    }
  ],
  origins: []
};

const environmentResponse = {
  url: () => 'https://approve-org.test/api/environment'
};

test.describe('authenticated API request bootstrap', () => {
  test('retries one transient environment bootstrap abort before creating the authenticated context state', async () => {
    let getCalls = 0;
    const requestContext = {
      get: async () => {
        getCalls += 1;
        if (getCalls === 1) {
          throw new Error('apiRequestContext.get: aborted');
        }
        return environmentResponse;
      },
      storageState: async () => storageState
    };

    await expect(bootstrapCsrfStorageState(requestContext as never, 2, 0)).resolves.toEqual({
      storageState,
      xsrfToken: 'redacted-token'
    });
    expect(getCalls).toBe(2);
  });

  test('does not retry a non-transport bootstrap error', async () => {
    let getCalls = 0;
    const requestContext = {
      get: async () => {
        getCalls += 1;
        throw new Error('Unable to resolve preview configuration');
      },
      storageState: async () => storageState
    };

    await expect(bootstrapCsrfStorageState(requestContext as never, 2, 0)).rejects.toThrow('Unable to resolve preview configuration');
    expect(getCalls).toBe(1);
  });

  test('fails after the bounded retry when the bootstrap transport remains unavailable', async () => {
    let getCalls = 0;
    const requestContext = {
      get: async () => {
        getCalls += 1;
        throw new Error('apiRequestContext.get: aborted');
      },
      storageState: async () => storageState
    };

    await expect(bootstrapCsrfStorageState(requestContext as never, 2, 0)).rejects.toThrow('apiRequestContext.get: aborted');
    expect(getCalls).toBe(2);
  });
});

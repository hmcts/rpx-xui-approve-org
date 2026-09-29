import { expect, test, type APIRequestContext } from '@playwright/test';
import { postOrganisationSearch } from './helpers/search.helpers';

function fakeApiRequest(statuses: number[]): APIRequestContext {
  let call = 0;

  return {
    post: async () => {
      const status = statuses[Math.min(call++, statuses.length - 1)];
      return { status: () => status };
    }
  } as unknown as APIRequestContext;
}

test.describe('organisation search helper', () => {
  test('retries transient gateway responses and returns the recovered response', async () => {
    const response = await postOrganisationSearch(
      fakeApiRequest([502, 200]),
      'ACTIVE',
      {},
      {},
      { attempts: 2, retryDelayMs: 0 }
    );

    expect(response.status()).toBe(200);
  });

  test('does not retry a non-transient response', async () => {
    const response = await postOrganisationSearch(
      fakeApiRequest([400, 200]),
      'ACTIVE',
      {},
      {},
      { attempts: 2, retryDelayMs: 0 }
    );

    expect(response.status()).toBe(400);
  });
});

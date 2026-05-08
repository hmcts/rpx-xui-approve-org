import { test, expect } from './helpers/api.fixtures';

const DEFAULT_ACCOUNT_NAMES = 'PBA1088483,PBA0088344';

test.describe('Playwright API: pba accounts', () => {
  test('GET /api/pbaAccounts returns one entry per requested account', async ({ apiRequest }) => {
    const accountNames = process.env.PW_API_PBA_ACCOUNT_NAMES || DEFAULT_ACCOUNT_NAMES;
    const response = await apiRequest.get('/api/pbaAccounts', {
      params: { accountNames },
      failOnStatusCode: false
    });
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');
    const payload = await response.json();

    expect(Array.isArray(payload)).toBe(true);
    const expectedCount = accountNames.split(',').map((name) => name.trim()).filter(Boolean).length;
    expect(payload).toHaveLength(expectedCount);

    if (payload.length > 0) {
      expect(payload[0]).toHaveProperty('account_name');
    }
  });
});

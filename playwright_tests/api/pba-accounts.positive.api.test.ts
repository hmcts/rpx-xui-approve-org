import { test, expect } from './helpers/api.fixtures';
import { pbaAccountsShapeErrors, resolveHeader } from './helpers/json-contracts';


test.describe('Playwright API positive: pba accounts', () => {
  test('GET /api/pbaAccounts returns one item per requested account', async ({ apiRequest }) => {
    const accountNames = process.env.PW_API_PBA_ACCOUNT_NAMES || 'PBA1088483';
    const response = await apiRequest.get('/api/pbaAccounts', {
      params: { accountNames },
      failOnStatusCode: false
    });
    expect(response.status()).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(contentType).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = pbaAccountsShapeErrors(payload);
    expect(shapeErrors).toEqual([]);

    const expectedCount = accountNames
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .length;
    expect(payload).toHaveLength(expectedCount);
  });

});

import { test, expect } from './helpers/api.fixtures';
import { pbaAccountsShapeErrors, resolveHeader } from './helpers/json-contracts';

test.describe('Playwright API positive: pba accounts', { tag: ['@pba-accounts', '@positive'] }, () => {
  test('GET /api/pbaAccounts returns one item per requested account', async ({ apiRequest }) => {
    const accountNames = process.env.PW_API_PBA_ACCOUNT_NAMES || 'PBA1088483';
    const response = await apiRequest.get('/api/pbaAccounts', {
      params: { accountNames },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/pbaAccounts for accountNames=${accountNames}. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type from GET /api/pbaAccounts. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = pbaAccountsShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected pba accounts payload shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const expectedCount = accountNames
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .length;
    expect(
      payload,
      `Expected one response item per requested account. expectedCount=${expectedCount}, actualCount=${Array.isArray(payload) ? payload.length : 'n/a'}`
    ).toHaveLength(expectedCount);
  });
});

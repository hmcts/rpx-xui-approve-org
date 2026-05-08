import { test, expect } from './helpers/api.fixtures';
import { pbaAccountsMissingParameterErrors, resolveHeader } from './helpers/json-contracts';

const missingResponseError = {
  "apiError": "Account is missing",
  "apiStatusCode": "400",
  "message": "Fee And Pay route error"
}

test.describe('Playwright API negative: pba accounts', () => {
  test('GET /api/pbaAccounts without accountNames returns an error payload', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/pbaAccounts', { failOnStatusCode: false });
    expect(response.status()).toBe(500);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(contentType).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = pbaAccountsMissingParameterErrors(payload);
    expect(shapeErrors).toEqual([]);
    expect(payload).toEqual(missingResponseError);
  });

  test('GET /api/pbaAccounts without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/pbaAccounts?accountNames=PBA1088483', { failOnStatusCode: false });
    expect(response.ok()).toBe(false);
    expect([302, 401, 403]).toContain(response.status());

    if (response.status() === 302) {
      const location = response.headers().location ?? '';
      expect(location.toLowerCase()).toContain('login');
    }
  });

});

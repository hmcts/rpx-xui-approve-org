import { test, expect } from './helpers/api.fixtures';
import { resolvePbaUpdateTarget } from './helpers/pba-test-data.helpers';

test.describe('Playwright API positive: update pba', { tag: ['@update-pba', '@positive'] }, () => {
  test('PUT /api/updatePba accepts payment account updates', async ({ apiRequest }) => {
    const setupTarget = await resolvePbaUpdateTarget(apiRequest, 1);
    const payload = {
      paymentAccounts: setupTarget.paymentAccounts,
      orgId: setupTarget.orgId
    };

    const response = await apiRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false
    });
    expect(response.status()).toBe(200);

    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');
  });

  test('PUT /api/updatePba accepts multiple payment account updates', async ({ apiRequest }) => {
    const setupTarget = await resolvePbaUpdateTarget(apiRequest, 2);
    const payload = {
      paymentAccounts: setupTarget.paymentAccounts,
      orgId: setupTarget.orgId
    };

    const response = await apiRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false
    });
    expect(response.status()).toBe(200);

    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');
  });
});

import { test, expect } from './helpers/api.fixtures';

const UPDATE_PBA_ORG_ID = process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';
const UPDATE_PBA_ACCOUNT_PRIMARY = process.env.PW_API_UPDATE_PBA_ACCOUNT_PRIMARY || 'PBA33L6BNO';
const UPDATE_PBA_ACCOUNT_SECONDARY = process.env.PW_API_UPDATE_PBA_ACCOUNT_SECONDARY || 'PBA44J5MNP';

test.describe.skip('Playwright API positive: update pba', { tag: ['@update-pba', '@positive'] }, () => {
  test('PUT /api/updatePba accepts payment account updates', async ({ apiRequest }) => {
    const payload = {
      paymentAccounts: [UPDATE_PBA_ACCOUNT_PRIMARY],
      orgId: UPDATE_PBA_ORG_ID
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
    const payload = {
      paymentAccounts: [UPDATE_PBA_ACCOUNT_PRIMARY, UPDATE_PBA_ACCOUNT_SECONDARY],
      orgId: UPDATE_PBA_ORG_ID
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

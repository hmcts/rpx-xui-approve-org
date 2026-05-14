import { test, expect } from './helpers/api.fixtures';

const UPDATE_PBA_ORG_ID = process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';

test.describe.skip('Playwright API positive: update pba', { tag: ['@update-pba', '@positive'] }, () => {
  test('PUT /api/updatePba accepts payment account updates', async ({ apiRequest }) => {
    const payload = {
      paymentAccounts: ['PBA33L6BNO'],
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

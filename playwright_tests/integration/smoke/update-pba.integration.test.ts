import { test, expect } from '../helpers/integration.fixtures';

const UPDATE_PBA_ORG_ID = process.env.PW_INTEGRATION_UPDATE_PBA_ORG_ID || process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';

test.describe('Playwright integration seed: update pba', { tag: ['@integration', '@seed', '@write', '@update-pba'] }, () => {
  test('PUT /api/updatePba accepts a write payload without 5xx errors', async ({ integrationRequest }) => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const payload = {
      paymentAccounts: [`PBA1${uniqueSuffix}`, `PBA2${uniqueSuffix}`],
      orgId: UPDATE_PBA_ORG_ID
    };

    const response = await integrationRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected non-5xx status for PUT /api/updatePba. Received status=${httpStatus}`
    ).toBeLessThan(500);

    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');
  });
});

import { test, expect } from './helpers/api.fixtures';
import { resolvePbaStatusUpdateTarget } from './helpers/pba-test-data.helpers';

test.describe('Playwright API positive: update pba status', { tag: ['@update-pba-status', '@positive'] }, () => {
  test('PUT /api/updatePba/status sets status for pba numbers', async ({ apiRequest }) => {
    const setupTarget = await resolvePbaStatusUpdateTarget(apiRequest);
    test.skip(
      !setupTarget,
      'No exposed setup flow creates an active provisioned organisation with pending PBAs; skipping instead of using ambient AAT PBA data.'
    );

    const payload = {
      orgId: setupTarget.orgId,
      pbaNumbers: [
        { pbaNumber: setupTarget.pbaNumber, status: 'ACCEPTED', statusMessage: '' }
      ]
    };

    const response = await apiRequest.put('/api/updatePba/status', {
      data: payload,
      failOnStatusCode: false
    });

    expect(response.status()).toBe(200);

    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');
  });
});

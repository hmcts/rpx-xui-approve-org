import { test, expect } from './helpers/api.fixtures';
import { resolvePbaStatusUpdateTarget } from './helpers/pba-test-data.helpers';

const PBA_STATUS_ENDPOINT = '/api/pba/status';

test.describe('Playwright API positive: update pba status', { tag: ['@update-pba-status', '@positive'] }, () => {
  test('PUT /api/pba/status sets status for pba numbers', async ({ apiRequest }) => {
    const setupTarget = await resolvePbaStatusUpdateTarget(apiRequest);
    const payload = {
      orgId: setupTarget.orgId,
      pbaNumbers: setupTarget.pbaNumbers.map((pbaNumber) => ({
        pbaNumber,
        status: 'accepted',
        statusMessage: ''
      }))
    };

    const response = await apiRequest.put(PBA_STATUS_ENDPOINT, {
      data: payload,
      failOnStatusCode: false
    });
    const rawBody = await response.text();

    expect(
      response.status(),
      `Expected 200 from PUT ${PBA_STATUS_ENDPOINT} for orgId=${setupTarget.orgId} pbaNumbers=${setupTarget.pbaNumbers.join(',')}. Received status=${response.status()} body=${rawBody}`
    ).toBe(200);
    expect(typeof rawBody).toBe('string');
  });
});

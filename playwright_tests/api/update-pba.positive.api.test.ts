import { test, expect } from './helpers/api.fixtures';
import { cleanupProvisionedOrganisation } from './helpers/organisations-write.helpers';
import { resolvePbaUpdateTarget } from './helpers/pba-test-data.helpers';

test.describe('Playwright API positive: update pba', { tag: ['@update-pba', '@positive'] }, () => {
  test('PUT /api/updatePba accepts payment account updates', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const setupTarget = await resolvePbaUpdateTarget(apiRequest, 1);
      organisationId = setupTarget.orgId;
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
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('PUT /api/updatePba accepts multiple payment account updates', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const setupTarget = await resolvePbaUpdateTarget(apiRequest, 2);
      organisationId = setupTarget.orgId;
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
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

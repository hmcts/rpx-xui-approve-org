import { test, expect } from './helpers/api.fixtures';
import { cleanupProvisionedOrganisation } from './helpers/organisations-write.helpers';
import {
  extractOrganisationPbaRecords,
  loadOrganisationWithExpectedPbaState,
  pbaRecordsContainField
} from './helpers/pba-status.helpers';
import { resolvePbaUpdateTarget } from './helpers/pba-test-data.helpers';

const UPDATE_PBA_ENDPOINT = '/api/updatePba';

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

      const response = await apiRequest.put(UPDATE_PBA_ENDPOINT, {
        data: payload,
        failOnStatusCode: false
      });
      const rawBody = await response.text();

      expect(
        response.status(),
        `Expected 200 from PUT ${UPDATE_PBA_ENDPOINT} for orgId=${setupTarget.orgId} paymentAccounts=${setupTarget.paymentAccounts.join(',')}. ` +
        `Received status=${response.status()} body=${rawBody}`
      ).toBe(200);
      expect(typeof rawBody).toBe('string');

      const updatedOrganisation = await loadOrganisationWithExpectedPbaState(
        apiRequest,
        setupTarget.orgId,
        setupTarget.paymentAccounts,
        []
      );

      expect(
        updatedOrganisation,
        `Expected to reload orgId=${setupTarget.orgId} with persisted paymentAccounts=${setupTarget.paymentAccounts.join(',')}.`
      ).toBeTruthy();
      if (!updatedOrganisation) {
        return;
      }

      const pbaRecords = extractOrganisationPbaRecords(updatedOrganisation);
      for (const paymentAccount of setupTarget.paymentAccounts) {
        expect(
          pbaRecordsContainField(pbaRecords, paymentAccount, 'paymentAccount'),
          `Expected orgId=${setupTarget.orgId} paymentAccount=${paymentAccount} to be persisted. ` +
          `Received pbaRecords=${JSON.stringify(pbaRecords)}`
        ).toBe(true);
      }
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

      const response = await apiRequest.put(UPDATE_PBA_ENDPOINT, {
        data: payload,
        failOnStatusCode: false
      });
      const rawBody = await response.text();

      expect(
        response.status(),
        `Expected 200 from PUT ${UPDATE_PBA_ENDPOINT} for orgId=${setupTarget.orgId} paymentAccounts=${setupTarget.paymentAccounts.join(',')}. ` +
        `Received status=${response.status()} body=${rawBody}`
      ).toBe(200);
      expect(typeof rawBody).toBe('string');

      const updatedOrganisation = await loadOrganisationWithExpectedPbaState(
        apiRequest,
        setupTarget.orgId,
        setupTarget.paymentAccounts,
        []
      );

      expect(
        updatedOrganisation,
        `Expected to reload orgId=${setupTarget.orgId} with persisted paymentAccounts=${setupTarget.paymentAccounts.join(',')}.`
      ).toBeTruthy();
      if (!updatedOrganisation) {
        return;
      }

      const pbaRecords = extractOrganisationPbaRecords(updatedOrganisation);
      for (const paymentAccount of setupTarget.paymentAccounts) {
        expect(
          pbaRecordsContainField(pbaRecords, paymentAccount, 'paymentAccount'),
          `Expected orgId=${setupTarget.orgId} paymentAccount=${paymentAccount} to be persisted. ` +
          `Received pbaRecords=${JSON.stringify(pbaRecords)}`
        ).toBe(true);
      }
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

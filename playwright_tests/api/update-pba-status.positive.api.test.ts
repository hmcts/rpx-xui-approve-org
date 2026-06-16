import { test, expect } from './helpers/api.fixtures';
import {
  extractOrganisationPbaRecords,
  loadOrganisationWithExpectedPbaState,
  pbaRecordsContainField,
  pbaRecordsContainStatus
} from './helpers/pba-status.helpers';
import { resolvePbaStatusUpdateTarget } from './helpers/pba-test-data.helpers';

const PBA_STATUS_ENDPOINT = '/api/pba/status';

const pbaStatusUpdateScenarios = [
  {
    name: 'accepts two pba numbers',
    statuses: ['accepted', 'accepted']
  },
  {
    name: 'rejects one pba number and accepts one pba number',
    statuses: ['rejected', 'accepted']
  },
  {
    name: 'rejects two pba numbers',
    statuses: ['rejected', 'rejected']
  }
] as const;

test.describe('Playwright API positive: update pba status', { tag: ['@update-pba-status', '@positive'] }, () => {
  for (const scenario of pbaStatusUpdateScenarios) {
    test(`PUT /api/pba/status ${scenario.name}`, async ({ apiRequest }) => {
      const setupTarget = await resolvePbaStatusUpdateTarget(scenario.statuses.length);
      const payload = {
        orgId: setupTarget.orgId,
        pbaNumbers: setupTarget.pbaNumbers.map((pbaNumber, index) => ({
          pbaNumber,
          status: scenario.statuses[index],
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
        `Expected 200 from PUT ${PBA_STATUS_ENDPOINT} for orgId=${setupTarget.orgId} pbaNumbers=${setupTarget.pbaNumbers.join(',')} statuses=${scenario.statuses.join(',')}. Received status=${response.status()} body=${rawBody}`
      ).toBe(200);
      expect(typeof rawBody).toBe('string');

      const acceptedPbaNumbers = payload.pbaNumbers
        .filter((pbaNumber) => pbaNumber.status === 'accepted')
        .map((pbaNumber) => pbaNumber.pbaNumber);
      const rejectedPbaNumbers = payload.pbaNumbers
        .filter((pbaNumber) => pbaNumber.status === 'rejected')
        .map((pbaNumber) => pbaNumber.pbaNumber);
      const updatedOrganisation = await loadOrganisationWithExpectedPbaState(
        apiRequest,
        setupTarget.orgId,
        acceptedPbaNumbers,
        rejectedPbaNumbers
      );

      expect(
        updatedOrganisation,
        `Expected to load updated org-specific payload for orgId=${setupTarget.orgId}.`
      ).toBeTruthy();
      if (!updatedOrganisation) {
        return;
      }

      const pbaRecords = extractOrganisationPbaRecords(updatedOrganisation);
      for (const pbaNumber of acceptedPbaNumbers) {
        expect(
          pbaRecordsContainStatus(pbaRecords, pbaNumber, 'accepted') ||
            pbaRecordsContainField(pbaRecords, pbaNumber, 'paymentAccount'),
          `Expected orgId=${setupTarget.orgId} pbaNumber=${pbaNumber} to be accepted on the org. Received pbaRecords=${JSON.stringify(pbaRecords)}`
        ).toBe(true);
      }

      for (const pbaNumber of rejectedPbaNumbers) {
        expect(
          pbaRecordsContainStatus(pbaRecords, pbaNumber, 'rejected') ||
            (
              !pbaRecordsContainField(pbaRecords, pbaNumber, 'paymentAccount') &&
              !pbaRecordsContainField(pbaRecords, pbaNumber, 'pendingPaymentAccount') &&
              !pbaRecordsContainField(pbaRecords, pbaNumber, 'pendingAddPaymentAccount')
            ),
          `Expected orgId=${setupTarget.orgId} pbaNumber=${pbaNumber} to be rejected on the org. Received pbaRecords=${JSON.stringify(pbaRecords)}`
        ).toBe(true);
      }
    });
  }
});

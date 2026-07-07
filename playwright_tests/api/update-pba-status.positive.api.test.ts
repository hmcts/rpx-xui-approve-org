import { test, expect } from './helpers/api.fixtures';
import {
  extractOrganisationPbaRecords,
  loadOrganisationWithExpectedPbaState,
  loadOrganisationWithPendingPbaState,
  pbaRecordsContainField,
  pbaRecordsContainPendingState,
  pbaRecordsContainStatus
} from './helpers/pba-status.helpers';
import {
  cleanupPbaStatusUpdateTarget,
  type PbaStatusTarget,
  resolvePbaStatusUpdateTarget
} from './helpers/pba-test-data.helpers';

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
  test.describe.configure({ mode: 'serial' });

  let cleanupTarget: PbaStatusTarget | null = null;

  test.afterEach(async ({ apiRequest }) => {
    const target = cleanupTarget;
    cleanupTarget = null;

    if (!target) {
      return;
    }

    await cleanupPbaStatusUpdateTarget(apiRequest, target);
  });

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
      const acceptedPbaNumbers = payload.pbaNumbers
        .filter((pbaNumber) => pbaNumber.status === 'accepted')
        .map((pbaNumber) => pbaNumber.pbaNumber);
      const rejectedPbaNumbers = payload.pbaNumbers
        .filter((pbaNumber) => pbaNumber.status === 'rejected')
        .map((pbaNumber) => pbaNumber.pbaNumber);
      cleanupTarget = setupTarget;

      const pendingOrganisation = await loadOrganisationWithPendingPbaState(
        apiRequest,
        setupTarget.orgId,
        setupTarget.pbaNumbers
      );

      expect(
        pendingOrganisation,
        `Expected generated PBAs to be pending on orgId=${setupTarget.orgId} before PUT ${PBA_STATUS_ENDPOINT}. pbaNumbers=${setupTarget.pbaNumbers.join(',')}`
      ).toBeTruthy();
      if (!pendingOrganisation) {
        return;
      }

      const pendingPbaRecords = extractOrganisationPbaRecords(pendingOrganisation);
      for (const pbaNumber of setupTarget.pbaNumbers) {
        expect(
          pbaRecordsContainPendingState(pendingPbaRecords, pbaNumber),
          `Expected orgId=${setupTarget.orgId} pbaNumber=${pbaNumber} to be pending before status update. Received pbaRecords=${JSON.stringify(pendingPbaRecords)}`
        ).toBe(true);
      }

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
              !pbaRecordsContainField(pbaRecords, pbaNumber, 'pendingAddPaymentAccount') &&
              !pbaRecordsContainField(pbaRecords, pbaNumber, 'pbaNumbers')
            ),
          `Expected orgId=${setupTarget.orgId} pbaNumber=${pbaNumber} to be rejected or removed from pending/accepted org fields. Received pbaRecords=${JSON.stringify(pbaRecords)}`
        ).toBe(true);
      }
    });
  }
});

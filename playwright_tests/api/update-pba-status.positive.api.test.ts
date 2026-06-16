import type { APIRequestContext } from '@playwright/test';
import { test, expect } from './helpers/api.fixtures';
import { loadOrganisationById, type OrganisationRecord } from './helpers/organisations-write.helpers';
import { resolvePbaStatusUpdateTarget } from './helpers/pba-test-data.helpers';

const PBA_STATUS_ENDPOINT = '/api/pba/status';
const ORGANISATION_READ_RETRIES = 6;
const ORGANISATION_PBA_FIELDS = [
  'paymentAccount',
  'pendingPaymentAccount',
  'pendingAddPaymentAccount',
  'pendingRemovePaymentAccount',
  'pbaNumbers'
] as const;

type PbaReviewStatus = 'accepted' | 'rejected';
type OrganisationPbaRecord = {
  field: string;
  pbaNumber: string;
  status?: string;
};
type PbaRecordValue = {
  pbaNumber?: unknown;
  paymentAccount?: unknown;
  status?: unknown;
};

const pbaStatusUpdateScenarios: Array<{
  name: string;
  statuses: PbaReviewStatus[];
}> = [
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
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseStatus(status: string): string {
  return status.toLowerCase();
}

function extractPbaNumber(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const pbaRecord = value as PbaRecordValue;
  if (typeof pbaRecord.pbaNumber === 'string' && pbaRecord.pbaNumber.trim() !== '') {
    return pbaRecord.pbaNumber;
  }

  if (typeof pbaRecord.paymentAccount === 'string' && pbaRecord.paymentAccount.trim() !== '') {
    return pbaRecord.paymentAccount;
  }

  return null;
}

function extractPbaStatus(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const status = (value as PbaRecordValue).status;
  return typeof status === 'string' && status.trim() !== '' ? normaliseStatus(status) : undefined;
}

function extractOrganisationPbaRecords(organisation: OrganisationRecord): OrganisationPbaRecord[] {
  return ORGANISATION_PBA_FIELDS.flatMap((field) => {
    const value = organisation[field];
    const fieldValues = Array.isArray(value) ? value : [];

    return fieldValues
      .map((fieldValue) => {
        const pbaNumber = extractPbaNumber(fieldValue);
        return pbaNumber ? {
          field,
          pbaNumber,
          status: extractPbaStatus(fieldValue)
        } : null;
      })
      .filter((pbaRecord): pbaRecord is OrganisationPbaRecord => pbaRecord !== null);
  });
}

function pbaRecordsContainStatus(
  pbaRecords: OrganisationPbaRecord[],
  pbaNumber: string,
  expectedStatus: PbaReviewStatus
): boolean {
  return pbaRecords.some((pbaRecord) =>
    pbaRecord.pbaNumber === pbaNumber && pbaRecord.status === expectedStatus
  );
}

function pbaRecordsContainField(
  pbaRecords: OrganisationPbaRecord[],
  pbaNumber: string,
  field: string
): boolean {
  return pbaRecords.some((pbaRecord) => pbaRecord.pbaNumber === pbaNumber && pbaRecord.field === field);
}

function hasExpectedOrganisationPbaState(
  organisation: OrganisationRecord,
  acceptedPbaNumbers: string[],
  rejectedPbaNumbers: string[]
): boolean {
  const pbaRecords = extractOrganisationPbaRecords(organisation);

  return acceptedPbaNumbers.every((pbaNumber) =>
    pbaRecordsContainStatus(pbaRecords, pbaNumber, 'accepted') ||
    pbaRecordsContainField(pbaRecords, pbaNumber, 'paymentAccount')
  ) && rejectedPbaNumbers.every((pbaNumber) =>
    pbaRecordsContainStatus(pbaRecords, pbaNumber, 'rejected') ||
    (
      !pbaRecordsContainField(pbaRecords, pbaNumber, 'paymentAccount') &&
      !pbaRecordsContainField(pbaRecords, pbaNumber, 'pendingPaymentAccount') &&
      !pbaRecordsContainField(pbaRecords, pbaNumber, 'pendingAddPaymentAccount')
    )
  );
}

async function loadOrganisationWithExpectedPbaState(
  apiRequest: APIRequestContext,
  organisationId: string,
  acceptedPbaNumbers: string[],
  rejectedPbaNumbers: string[]
): Promise<OrganisationRecord | null> {
  let lastOrganisation: OrganisationRecord | null = null;

  for (let attempt = 1; attempt <= ORGANISATION_READ_RETRIES; attempt += 1) {
    const organisation = await loadOrganisationById(apiRequest, organisationId);
    lastOrganisation = organisation;

    if (organisation && hasExpectedOrganisationPbaState(organisation, acceptedPbaNumbers, rejectedPbaNumbers)) {
      return organisation;
    }

    await sleep(500 * attempt);
  }

  return lastOrganisation;
}

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

      const pbaRecords = extractOrganisationPbaRecords(updatedOrganisation as OrganisationRecord);
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

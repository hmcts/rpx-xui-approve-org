import type { APIRequestContext } from '@playwright/test';
import { loadOrganisationById, type OrganisationRecord } from './organisations-write.helpers';
import { parseJsonIfPresent, resolveHeader } from './json-contracts';

const ORGANISATION_READ_RETRIES = 6;
const PBA_STATUS_LIST_RETRIES = 3;
const ORGANISATION_PBA_FIELDS = [
  'paymentAccount',
  'pendingPaymentAccount',
  'pendingAddPaymentAccount',
  'pendingRemovePaymentAccount',
  'pbaNumbers'
] as const;

export type PbaReviewStatus = 'accepted' | 'rejected';

export type PbaStatusUpdateScenario = {
  name: string;
  statuses: PbaReviewStatus[];
};

export type PbaStatusListResult = {
  contentType: string;
  httpStatus: number;
  payload: unknown;
  rawBody: string;
};

export type OrganisationPbaRecord = {
  field: string;
  pbaNumber: string;
  status?: string;
};

type PbaRecordValue = {
  pbaNumber?: unknown;
  paymentAccount?: unknown;
  status?: unknown;
};

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

export function extractOrganisationPbaRecords(organisation: OrganisationRecord): OrganisationPbaRecord[] {
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

export function pbaRecordsContainStatus(
  pbaRecords: OrganisationPbaRecord[],
  pbaNumber: string,
  expectedStatus: PbaReviewStatus
): boolean {
  return pbaRecords.some((pbaRecord) =>
    pbaRecord.pbaNumber === pbaNumber && pbaRecord.status === expectedStatus
  );
}

export function pbaRecordsContainField(
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

export async function loadOrganisationWithExpectedPbaState(
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

export async function getPbaStatusList(
  apiRequest: APIRequestContext,
  statusValue: string
): Promise<PbaStatusListResult> {
  let lastResult: PbaStatusListResult | null = null;

  for (let attempt = 1; attempt <= PBA_STATUS_LIST_RETRIES; attempt += 1) {
    const response = await apiRequest.get(`/api/pba/status/${statusValue}`, { failOnStatusCode: false });
    const httpStatus = response.status();
    const contentType = resolveHeader(response.headers(), 'content-type');
    const rawBody = await response.text();
    const payload = parseJsonIfPresent(contentType, rawBody);
    const result = { contentType, httpStatus, payload, rawBody };

    if (httpStatus === 200 && Array.isArray(payload)) {
      return result;
    }

    lastResult = result;
    await sleep(500 * attempt);
  }

  return lastResult as PbaStatusListResult;
}

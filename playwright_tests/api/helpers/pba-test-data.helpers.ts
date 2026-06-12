import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { provisionPendingOrganisation } from './organisations-write.helpers';
import { createPbaSearchPayload, getXsrfHeaders } from './search.helpers';

export type PbaStatusTarget = {
  orgId: string;
  pbaNumbers: string[];
};

export type PbaUpdateTarget = {
  orgId: string;
  paymentAccounts: string[];
};

type PbaStatusOrganisation = {
  organisationIdentifier?: unknown;
  organisationId?: unknown;
  pbaNumbers?: unknown;
  [key: string]: unknown;
};

type PbaStatusSearchEnvelope = {
  organisations?: unknown;
};

const PBA_STATUS_PENDING_ENDPOINT = '/api/pba/status/pending';
const PBA_NUMBER_PATTERN = /^PBA[A-Z0-9]{7}$/i;
const PENDING_PBA_PAGE_SIZE = 10;
const MAX_PENDING_PBA_SEARCH_PAGES = 20;

function generatePbaNumber(): string {
  const suffix = randomBytes(5).toString('hex').slice(0, 7).toUpperCase();
  return `PBA${suffix}`;
}

function parseJsonIfPresent(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractPbaStatusOrganisations(payload: unknown): PbaStatusOrganisation[] {
  if (Array.isArray(payload)) {
    return payload as PbaStatusOrganisation[];
  }

  if (isObject(payload)) {
    const organisations = (payload as PbaStatusSearchEnvelope).organisations;
    if (Array.isArray(organisations)) {
      return organisations as PbaStatusOrganisation[];
    }
  }

  return [];
}

function extractOrganisationId(organisation: PbaStatusOrganisation): string | null {
  const organisationId = organisation.organisationIdentifier ?? organisation.organisationId;
  return typeof organisationId === 'string' && organisationId.trim() !== '' ? organisationId : null;
}

function extractPendingPbaNumbers(organisation: PbaStatusOrganisation): string[] {
  if (!Array.isArray(organisation.pbaNumbers)) {
    return [];
  }

  return organisation.pbaNumbers
    .filter(isObject)
    .filter((pbaRecord) => {
      const status = pbaRecord.status;
      return typeof status !== 'string' || status.toLowerCase() === 'pending';
    })
    .map((pbaRecord) => pbaRecord.pbaNumber)
    .filter((pbaNumber): pbaNumber is string => typeof pbaNumber === 'string' && pbaNumber.trim() !== '');
}

function resolvePendingStatusTarget(payload: unknown): PbaStatusTarget | null {
  const organisations = extractPbaStatusOrganisations(payload);
  const organisation = organisations.find((organisation) =>
    extractOrganisationId(organisation) &&
    extractPendingPbaNumbers(organisation).some((pbaNumber) => PBA_NUMBER_PATTERN.test(pbaNumber))
  );
  if (!organisation) {
    return null;
  }

  const orgId = extractOrganisationId(organisation);
  if (!orgId) {
    return null;
  }

  const pendingPbaNumbers = extractPendingPbaNumbers(organisation);
  const preferredPbaNumbers = pendingPbaNumbers.filter((pbaNumber) => PBA_NUMBER_PATTERN.test(pbaNumber));

  return {
    orgId,
    pbaNumbers: preferredPbaNumbers
  };
}

export async function resolvePbaUpdateTarget(apiRequest: APIRequestContext, paymentAccountCount: number): Promise<PbaUpdateTarget> {
  const provisioned = await provisionPendingOrganisation(apiRequest, {
    firstName: 'Pba',
    lastName: 'Setup'
  });

  return {
    orgId: provisioned.organisationId,
    paymentAccounts: Array.from({ length: paymentAccountCount }, () => generatePbaNumber())
  };
}

export async function resolvePbaStatusUpdateTarget(apiRequest: APIRequestContext): Promise<PbaStatusTarget> {
  const xsrfHeaders = await getXsrfHeaders(apiRequest);
  let lastRawBody = '';

  for (let pageNumber = 1; pageNumber <= MAX_PENDING_PBA_SEARCH_PAGES; pageNumber += 1) {
    const response = await apiRequest.post(PBA_STATUS_PENDING_ENDPOINT, {
      headers: xsrfHeaders,
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber,
        pageSize: PENDING_PBA_PAGE_SIZE
      }),
      failOnStatusCode: false
    });
    const rawBody = await response.text();
    lastRawBody = rawBody;

    if (response.status() !== 200) {
      throw new Error(
        `Unable to source pending PBAs via POST ${PBA_STATUS_PENDING_ENDPOINT}. ` +
        `Expected 200, received ${response.status()} body=${rawBody}`
      );
    }

    const payload = parseJsonIfPresent(rawBody);
    const target = resolvePendingStatusTarget(payload);
    if (target) {
      return target;
    }
  }

  throw new Error(
    `Unable to source pending PBAs via POST ${PBA_STATUS_PENDING_ENDPOINT}. ` +
    `No PBA-shaped pending pbaNumbers found in the first ${MAX_PENDING_PBA_SEARCH_PAGES} pages. ` +
    `lastBody=${lastRawBody.slice(0, 1000)}`
  );
}

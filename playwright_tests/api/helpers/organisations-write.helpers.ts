import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { registerOrganisationViaExternalApi } from '../../helpers/register-org';
import { createOrganisationSearchPayload, getXsrfHeaders } from './search.helpers';

export type OrganisationRecord = {
  organisationIdentifier?: string;
  status?: string;
  [key: string]: unknown;
};

type OrganisationListItem = {
  organisationIdentifier?: unknown;
  [key: string]: unknown;
};

type OrganisationSearchEnvelope = {
  organisations?: unknown;
};

type ProvisionPendingOrganisationOptions = {
  firstName?: string;
  lastName?: string;
  workEmailAddress?: string;
  hasPBA?: boolean;
  pbaNumbers?: string[];
  timeoutMs?: number;
  pollIntervalMs?: number;
};

export type ProvisionedOrganisation = {
  organisationId: string;
  organisationSeed: string;
  firstName: string;
  lastName: string;
  workEmailAddress: string;
  pbaNumbers: string[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildOrganisationSeed(): string {
  return `pw-api-org-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
}

function objectContainsSeed(value: unknown, seed: string): boolean {
  try {
    return JSON.stringify(value).toLowerCase().includes(seed.toLowerCase());
  } catch {
    return false;
  }
}

function extractOrganisationId(candidate: OrganisationListItem | null | undefined): string | null {
  if (!candidate) {
    return null;
  }

  const orgId = candidate.organisationIdentifier;
  if (typeof orgId !== 'string' || orgId.trim() === '') {
    return null;
  }

  return orgId;
}

function extractOrganisationCandidates(payload: unknown): OrganisationListItem[] {
  if (Array.isArray(payload)) {
    return payload as OrganisationListItem[];
  }

  if (payload && typeof payload === 'object') {
    const organisations = (payload as OrganisationSearchEnvelope).organisations;
    if (Array.isArray(organisations)) {
      return organisations as OrganisationListItem[];
    }
  }

  return [];
}

async function registerPendingOrganisation(
  seed: string,
  firstName: string,
  lastName: string,
  workEmailAddress: string,
  hasPBA: boolean | undefined,
  pbaNumbers: string[] | undefined
): Promise<string[]> {
  const registeredOrganisation = await registerOrganisationViaExternalApi({
    userName: seed,
    firstName,
    lastName,
    workEmailAddress,
    hasPBA,
    pbaNumbers
  });

  return registeredOrganisation.pbaNumbers;
}

async function findPendingOrganisationBySeed(
  apiRequest: APIRequestContext,
  organisationSeed: string,
  timeoutMs: number,
  pollIntervalMs: number
): Promise<string | null> {
  const startTime = Date.now();
  const xsrfHeaders = await getXsrfHeaders(apiRequest);
  const searchPayload = createOrganisationSearchPayload({
    view: 'NEW',
    searchFilter: organisationSeed,
    pageNumber: 1,
    pageSize: 10
  });

  while (Date.now() - startTime < timeoutMs) {
    const response = await apiRequest.post('/api/organisations', {
      params: { status: 'PENDING,REVIEW' },
      headers: xsrfHeaders,
      data: searchPayload,
      failOnStatusCode: false
    });

    if (response.status() === 200) {
      const payload = await response.json();
      const matchedOrganisation = extractOrganisationCandidates(payload)
        .find((candidate) => objectContainsSeed(candidate, organisationSeed));
      const organisationId = extractOrganisationId(matchedOrganisation);

      if (organisationId) {
        return organisationId;
      }
    }

    await sleep(pollIntervalMs);
  }

  return null;
}

export async function provisionPendingOrganisation(
  apiRequest: APIRequestContext,
  options: ProvisionPendingOrganisationOptions = {}
): Promise<ProvisionedOrganisation> {
  const organisationSeed = buildOrganisationSeed();
  const firstName = options.firstName ?? 'Api';
  const lastName = options.lastName ?? 'Test';
  const workEmailAddress = options.workEmailAddress ?? `${organisationSeed}@mailinator.com`;
  const timeoutMs = options.timeoutMs ?? 120000;
  const pollIntervalMs = options.pollIntervalMs ?? 5000;

  const pbaNumbers = await registerPendingOrganisation(
    organisationSeed,
    firstName,
    lastName,
    workEmailAddress,
    options.hasPBA,
    options.pbaNumbers
  );

  const organisationId = await findPendingOrganisationBySeed(apiRequest, organisationSeed, timeoutMs, pollIntervalMs);
  if (!organisationId) {
    throw new Error(`Unable to locate newly registered pending organisation with seed=${organisationSeed} within ${timeoutMs}ms.`);
  }

  return {
    organisationId,
    organisationSeed,
    firstName,
    lastName,
    workEmailAddress,
    pbaNumbers
  };
}

export async function activateProvisionedOrganisation(
  apiRequest: APIRequestContext,
  provisioned: ProvisionedOrganisation
): Promise<ProvisionedOrganisation> {
  const sourceOrganisation = await loadOrganisationById(apiRequest, provisioned.organisationId);
  if (!sourceOrganisation) {
    throw new Error(`Unable to load provisioned organisation before activation id=${provisioned.organisationId}.`);
  }

  const response = await apiRequest.put(`/api/organisations/${provisioned.organisationId}`, {
    data: {
      ...sourceOrganisation,
      status: 'ACTIVE'
    },
    failOnStatusCode: false
  });

  if (response.status() !== 200) {
    const rawBody = await response.text();
    throw new Error(
      `Unable to activate provisioned organisation id=${provisioned.organisationId}. ` +
      `Expected 200 from PUT /api/organisations/${provisioned.organisationId}, received ${response.status()} body=${rawBody}`
    );
  }

  return provisioned;
}

export async function provisionActiveOrganisation(
  apiRequest: APIRequestContext,
  options: ProvisionPendingOrganisationOptions = {}
): Promise<ProvisionedOrganisation> {
  const provisioned = await provisionPendingOrganisation(apiRequest, options);
  return activateProvisionedOrganisation(apiRequest, provisioned);
}

export async function loadOrganisationById(
  apiRequest: APIRequestContext,
  organisationId: string
): Promise<OrganisationRecord | null> {
  const response = await apiRequest.get('/api/organisations', {
    params: {
      organisationId,
      version: 'v1'
    },
    failOnStatusCode: false
  });

  if (response.status() !== 200) {
    return null;
  }

  const payload = await response.json();
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return null;
  }

  return payload as OrganisationRecord;
}

export async function cleanupProvisionedOrganisation(
  apiRequest: APIRequestContext,
  organisationId: string | null | undefined
): Promise<void> {
  if (!organisationId) {
    return;
  }

  try {
    await apiRequest.delete(`/api/organisations/${organisationId}`, {
      data: {},
      failOnStatusCode: false
    });
  } catch {
    // Best-effort cleanup must not hide the test failure that triggered it.
  }
}

import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { registerOrganisationViaExternalApi } from '../../helpers/register-org';

export type OrganisationRecord = {
  organisationIdentifier?: string;
  status?: string;
  [key: string]: unknown;
};

type OrganisationListItem = {
  organisationIdentifier?: unknown;
  [key: string]: unknown;
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

  while (Date.now() - startTime < timeoutMs) {
    const response = await apiRequest.get('/api/organisations', {
      params: { status: 'PENDING' },
      failOnStatusCode: false
    });

    if (response.status() === 200) {
      const payload = await response.json();
      if (Array.isArray(payload)) {
        const matchedOrganisation = payload.find((candidate) => objectContainsSeed(candidate, organisationSeed)) as OrganisationListItem | undefined;
        const organisationId = extractOrganisationId(matchedOrganisation);

        if (organisationId) {
          return organisationId;
        }
      }
    }

    await sleep(pollIntervalMs);
  }

  return null;
}

export function assertUnauthenticatedDenied(httpStatus: number, messageContext: string): void {
  expect(
    [302, 401, 403],
    `Expected denied status to be one of 302/401/403 for ${messageContext}. Received status=${httpStatus}`
  ).toContain(httpStatus);
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

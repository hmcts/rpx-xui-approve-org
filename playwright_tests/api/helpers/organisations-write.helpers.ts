import { randomBytes } from 'node:crypto';
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { registerOrganisationViaExternalApi } from '../../helpers/register-org';
import { recordProvisionedOrganisation } from './organisation-cleanup-ledger';
export { cleanupProvisionedOrganisation, tryCleanupProvisionedOrganisation } from './organisation-cleanup';

export type OrganisationRecord = {
  organisationIdentifier?: string;
  status?: string;
  [key: string]: unknown;
};

type ProvisionPendingOrganisationOptions = {
  firstName?: string;
  lastName?: string;
  workEmailAddress?: string;
  hasPBA?: boolean;
  pbaNumbers?: string[];
};

export type ProvisionedOrganisation = {
  organisationId: string;
  organisationSeed: string;
  firstName: string;
  lastName: string;
  workEmailAddress: string;
  pbaNumbers: string[];
};

type OrganisationLoadOptions = {
  attempts?: number;
  retryDelayMs?: number;
};

type OrganisationWriteOptions = {
  attempts?: number;
  retryDelayMs?: number;
};

const TRANSIENT_ORGANISATION_STATUSES = new Set([502, 503, 504]);
const DEFAULT_ORGANISATION_READ_ATTEMPTS = 4;
const DEFAULT_ORGANISATION_READ_RETRY_DELAY_MS = 500;
const DEFAULT_ORGANISATION_WRITE_ATTEMPTS = 3;
const DEFAULT_ORGANISATION_WRITE_RETRY_DELAY_MS = 500;
const TRANSIENT_ORGANISATION_ERROR_PATTERN = /\b(aborted|econnreset|etimedout|socket hang up|fetch failed)\b/i;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientOrganisationError(error: unknown): boolean {
  return error instanceof Error && TRANSIENT_ORGANISATION_ERROR_PATTERN.test(error.message);
}

function buildOrganisationSeed(): string {
  return `pw-api-org-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
}

export function registeredOrganisationId(organisationIdentifier: string | undefined): string {
  const organisationId = organisationIdentifier?.trim();
  if (!organisationId) {
    throw new Error('Registration completed without an organisationIdentifier.');
  }

  return organisationId;
}

async function registerPendingOrganisation(
  seed: string,
  firstName: string,
  lastName: string,
  workEmailAddress: string,
  hasPBA: boolean | undefined,
  pbaNumbers: string[] | undefined
): Promise<{ organisationId: string; pbaNumbers: string[] }> {
  const registeredOrganisation = await registerOrganisationViaExternalApi({
    userName: seed,
    firstName,
    lastName,
    workEmailAddress,
    hasPBA,
    pbaNumbers
  });

  return {
    organisationId: registeredOrganisationId(registeredOrganisation.organisationIdentifier),
    pbaNumbers: registeredOrganisation.pbaNumbers
  };
}

export async function provisionPendingOrganisation(
  apiRequest: APIRequestContext,
  options: ProvisionPendingOrganisationOptions = {}
): Promise<ProvisionedOrganisation> {
  const organisationSeed = buildOrganisationSeed();
  const firstName = options.firstName ?? 'Api';
  const lastName = options.lastName ?? 'Test';
  const workEmailAddress = options.workEmailAddress ?? `${organisationSeed}@example.com`;
  const registeredOrganisation = await registerPendingOrganisation(
    organisationSeed,
    firstName,
    lastName,
    workEmailAddress,
    options.hasPBA,
    options.pbaNumbers
  );

  const { organisationId, pbaNumbers } = registeredOrganisation;

  recordProvisionedOrganisation(organisationId, organisationSeed);

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

  const response = await approveOrganisation(apiRequest, provisioned.organisationId, sourceOrganisation);

  if (response.status() !== 200) {
    const rawBody = await response.text();
    throw new Error(
      `Unable to activate provisioned organisation id=${provisioned.organisationId}. ` +
      `Expected 200 from PUT /api/organisations/${provisioned.organisationId}, received ${response.status()} body=${rawBody}`
    );
  }

  return provisioned;
}

export async function approveOrganisation(
  apiRequest: APIRequestContext,
  organisationId: string,
  sourceOrganisation: OrganisationRecord,
  options: OrganisationWriteOptions = {}
): Promise<APIResponse> {
  const attempts = options.attempts ?? DEFAULT_ORGANISATION_WRITE_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_ORGANISATION_WRITE_RETRY_DELAY_MS;
  let lastResponse: APIResponse | undefined;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await apiRequest.put(`/api/organisations/${organisationId}`, {
        data: {
          ...sourceOrganisation,
          status: 'ACTIVE'
        },
        failOnStatusCode: false
      });
      lastResponse = response;

      if (!TRANSIENT_ORGANISATION_STATUSES.has(response.status()) || attempt === attempts) {
        return response;
      }

      console.warn(
        `[organisation-write] transient approval failure id=${organisationId} status=${response.status()} attempt=${attempt}`
      );
    } catch (error) {
      if (!isTransientOrganisationError(error) || attempt === attempts) {
        throw error;
      }

      console.warn(`[organisation-write] transient approval error id=${organisationId} attempt=${attempt}: ${error}`);
    }

    await sleep(retryDelayMs * attempt);
  }

  if (!lastResponse) {
    throw new Error(`Approval request did not produce a response for organisation id=${organisationId}.`);
  }

  return lastResponse;
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
  organisationId: string,
  options: OrganisationLoadOptions = {}
): Promise<OrganisationRecord | null> {
  const attempts = options.attempts ?? DEFAULT_ORGANISATION_READ_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_ORGANISATION_READ_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await apiRequest.get('/api/organisations', {
        params: {
          organisationId,
          version: 'v1'
        },
        failOnStatusCode: false
      });

      if (response.status() === 200) {
        const payload = await response.json();
        if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
          return null;
        }

        return payload as OrganisationRecord;
      }

      if (!TRANSIENT_ORGANISATION_STATUSES.has(response.status())) {
        return null;
      }
    } catch (error) {
      if (!isTransientOrganisationError(error)) {
        throw error;
      }
    }

    if (attempt < attempts) {
      await sleep(retryDelayMs * attempt);
    }
  }

  return null;
}

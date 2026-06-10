import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

export type OrganisationRecord = {
  organisationIdentifier?: string;
  status?: string;
  [key: string]: unknown;
};

type FindDeletableOrganisationOptions = {
  preferredOrganisationId?: string;
};

export function assertUnauthenticatedDenied(httpStatus: number, messageContext: string): void {
  expect(
    [302, 401, 403],
    `Expected denied status to be one of 302/401/403 for ${messageContext}. Received status=${httpStatus}`
  ).toContain(httpStatus);
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

export async function findDeletablePendingOrganisationId(
  apiRequest: APIRequestContext,
  options: FindDeletableOrganisationOptions = {}
): Promise<string | null> {
  const preferredOrganisationId = options.preferredOrganisationId?.trim();
  if (!preferredOrganisationId) {
    return null;
  }

  const response = await apiRequest.get(`/api/organisations/${preferredOrganisationId}/isDeletable`, { failOnStatusCode: false });
  if (response.status() !== 200) {
    return null;
  }

  const payload = await response.json();
  if (payload?.organisationDeletable === true) {
    return preferredOrganisationId;
  }

  return null;
}

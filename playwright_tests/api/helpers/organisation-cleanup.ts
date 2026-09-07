import type { APIRequestContext } from '@playwright/test';
import { recordCleanedOrganisation } from './organisation-cleanup-ledger';

const CLEANUP_DELETE_ACCEPTED_STATUSES = [200, 404] as const;
const CLEANUP_DELETE_RETRYABLE_STATUSES = [500, 502, 503, 504] as const;
const CLEANUP_DELETE_ATTEMPTS = 3;
const CLEANUP_DELETE_RETRY_DELAY_MS = 1_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableCleanupError(error: unknown): boolean {
  return error instanceof Error && /ECONNRESET|ETIMEDOUT|socket hang up|fetch failed/i.test(error.message);
}

export async function tryCleanupProvisionedOrganisation(
  apiRequest: APIRequestContext,
  organisationId: string,
  attempts = CLEANUP_DELETE_ATTEMPTS,
  retryDelayMs = CLEANUP_DELETE_RETRY_DELAY_MS
): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await apiRequest.delete(`/api/organisations/${organisationId}`, {
        data: {},
        failOnStatusCode: false
      });
      const httpStatus = response.status();

      if (CLEANUP_DELETE_ACCEPTED_STATUSES.includes(httpStatus as typeof CLEANUP_DELETE_ACCEPTED_STATUSES[number])) {
        recordCleanedOrganisation(organisationId);
        return true;
      }

      if (!CLEANUP_DELETE_RETRYABLE_STATUSES.includes(httpStatus as typeof CLEANUP_DELETE_RETRYABLE_STATUSES[number])) {
        const rawBody = await response.text().catch(() => 'Unable to read response body');
        throw new Error(
          `Unable to cleanup provisioned organisation id=${organisationId}. ` +
          `Expected 200 from DELETE /api/organisations/${organisationId} or 404 for already-cleaned data, ` +
          `received ${httpStatus} body=${rawBody}`
        );
      }

      console.warn(`[organisation-cleanup] transient DELETE failure id=${organisationId} status=${httpStatus} attempt=${attempt}`);
    } catch (error) {
      if (!isRetryableCleanupError(error)) {
        throw error;
      }
      console.warn(`[organisation-cleanup] transient DELETE error id=${organisationId} attempt=${attempt}: ${error}`);
    }

    if (attempt < attempts) {
      await sleep(retryDelayMs);
    }
  }

  return false;
}

export async function cleanupProvisionedOrganisation(
  apiRequest: APIRequestContext,
  organisationId: string | null | undefined
): Promise<void> {
  if (!organisationId) {
    return;
  }

  const cleaned = await tryCleanupProvisionedOrganisation(apiRequest, organisationId);
  if (!cleaned) {
    console.warn(
      `[organisation-cleanup] deferred organisation id=${organisationId} after ${CLEANUP_DELETE_ATTEMPTS} ` +
      'attempts; Jenkins mop-up will retry the exact ID.'
    );
  }
}

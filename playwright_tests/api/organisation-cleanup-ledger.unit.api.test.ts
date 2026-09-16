import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  getOrganisationCleanupDirectory,
  readOutstandingOrganisations,
  recordProvisionedOrganisation
} from './helpers/organisation-cleanup-ledger';
import { tryCleanupProvisionedOrganisation } from './helpers/organisation-cleanup';

function fakeApiRequest(statuses: number[]): APIRequestContext {
  let callCount = 0;
  return {
    delete: async () => {
      const status = statuses[Math.min(callCount++, statuses.length - 1)];
      return {
        status: () => status,
        text: async () => `status=${status}`
      };
    }
  } as unknown as APIRequestContext;
}

test.describe('organisation cleanup ledger', () => {
  let ledgerDirectory: string;

  test.beforeEach(() => {
    ledgerDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'approve-org-cleanup-'));
    process.env.PLAYWRIGHT_ORGANISATION_CLEANUP_DIR = ledgerDirectory;
  });

  test.afterEach(() => {
    delete process.env.PLAYWRIGHT_ORGANISATION_CLEANUP_DIR;
    fs.rmSync(ledgerDirectory, { recursive: true, force: true });
  });

  test('retries transient delete failures and clears the exact ledger entry after success', async () => {
    recordProvisionedOrganisation('UO-RETRY', 'seed-retry');

    const cleaned = await tryCleanupProvisionedOrganisation(fakeApiRequest([502, 503, 200]), 'UO-RETRY', 3, 0);

    expect(cleaned).toBe(true);
    expect(readOutstandingOrganisations(getOrganisationCleanupDirectory())).toEqual([]);
  });

  test('leaves persistent transient failures for the mop-up', async () => {
    recordProvisionedOrganisation('UO-DEFER', 'seed-defer');

    const cleaned = await tryCleanupProvisionedOrganisation(fakeApiRequest([502]), 'UO-DEFER', 2, 0);

    expect(cleaned).toBe(false);
    expect(readOutstandingOrganisations(getOrganisationCleanupDirectory()).map((entry) => entry.organisationId)).toEqual([
      'UO-DEFER'
    ]);
  });

  test('still fails immediately for a non-transient cleanup response', async () => {
    await expect(
      tryCleanupProvisionedOrganisation(fakeApiRequest([403]), 'UO-FORBIDDEN', 1, 0)
    ).rejects.toThrow('received 403');
  });
});

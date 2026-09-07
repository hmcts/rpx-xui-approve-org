import { createAuthenticatedApiContext, isAuthenticatedRequestContext } from '../playwright_tests/api/helpers/authenticated-api-request';
import { tryCleanupProvisionedOrganisation } from '../playwright_tests/api/helpers/organisation-cleanup';
import {
  getOrganisationCleanupDirectory,
  readOutstandingOrganisations,
  writeCleanupReport
} from '../playwright_tests/api/helpers/organisation-cleanup-ledger';

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  const directory = getOrganisationCleanupDirectory();
  let outstanding = readOutstandingOrganisations(directory);
  if (outstanding.length === 0) {
    writeCleanupReport(directory, [], 0);
    console.log(`[organisation-mop-up] no outstanding organisations in ${directory}`);
    return;
  }

  let apiRequest = await createAuthenticatedApiContext();
  try {
    if (!(await isAuthenticatedRequestContext(apiRequest))) {
      await apiRequest.dispose();
      apiRequest = await createAuthenticatedApiContext(true);
      if (!(await isAuthenticatedRequestContext(apiRequest))) {
        throw new Error('[organisation-mop-up] authenticated API context could not be established');
      }
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS && outstanding.length > 0; attempt += 1) {
      const remaining = [];
      for (const entry of outstanding) {
        if (!(await tryCleanupProvisionedOrganisation(apiRequest, entry.organisationId, 1, 0))) {
          remaining.push(entry);
        }
      }
      outstanding = remaining;
      if (outstanding.length > 0 && attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  } finally {
    await apiRequest.dispose();
  }

  const reportPath = writeCleanupReport(directory, outstanding, MAX_ATTEMPTS);
  if (outstanding.length > 0) {
    throw new Error(
      `[organisation-mop-up] unable to delete ${outstanding.length} organisation(s); ` +
      `see ${reportPath}: ${outstanding.map((entry) => entry.organisationId).join(', ')}`
    );
  }

  console.log(`[organisation-mop-up] deleted all recorded organisations; report=${reportPath}`);
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

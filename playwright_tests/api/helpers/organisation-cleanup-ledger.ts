import * as fs from 'node:fs';
import * as path from 'node:path';

export type OrganisationCleanupLedgerEntry = {
  organisationId: string;
  organisationSeed?: string;
  event: 'provisioned' | 'cleaned';
  timestamp: string;
};

const DEFAULT_LEDGER_ROOT = path.resolve('test-results/organisation-cleanup');

function sanitisePathSegment(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'local';
}

export function getOrganisationCleanupDirectory(): string {
  const configuredDirectory = process.env.PLAYWRIGHT_ORGANISATION_CLEANUP_DIR?.trim();
  if (configuredDirectory) {
    return path.resolve(configuredDirectory);
  }

  const runId = sanitisePathSegment(
    process.env.PLAYWRIGHT_ORGANISATION_CLEANUP_RUN_ID ?? process.env.BUILD_TAG ?? 'local'
  );
  return path.join(DEFAULT_LEDGER_ROOT, runId);
}

function getLedgerPath(): string {
  return path.join(getOrganisationCleanupDirectory(), `organisations-${process.pid}.jsonl`);
}

function appendLedgerEntry(entry: OrganisationCleanupLedgerEntry): void {
  const ledgerPath = getLedgerPath();
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`, 'utf8');
}

export function recordProvisionedOrganisation(organisationId: string, organisationSeed?: string): void {
  appendLedgerEntry({
    organisationId,
    organisationSeed,
    event: 'provisioned',
    timestamp: new Date().toISOString()
  });
}

export function recordCleanedOrganisation(organisationId: string): void {
  appendLedgerEntry({
    organisationId,
    event: 'cleaned',
    timestamp: new Date().toISOString()
  });
}

export function readOutstandingOrganisations(directory = getOrganisationCleanupDirectory()): OrganisationCleanupLedgerEntry[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const latestByOrganisation = new Map<string, OrganisationCleanupLedgerEntry>();
  for (const fileName of fs.readdirSync(directory).filter((name) => name.endsWith('.jsonl'))) {
    const filePath = path.join(directory, fileName);
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean)) {
      try {
        const entry = JSON.parse(line) as OrganisationCleanupLedgerEntry;
        if (entry.organisationId && (entry.event === 'provisioned' || entry.event === 'cleaned')) {
          latestByOrganisation.set(entry.organisationId, entry);
        }
      } catch {
        // Ignore an incomplete final line; the cleanup report still shows valid entries.
      }
    }
  }

  return [...latestByOrganisation.values()].filter((entry) => entry.event === 'provisioned');
}

export function writeCleanupReport(
  directory: string,
  outstanding: OrganisationCleanupLedgerEntry[],
  attempts: number
): string {
  const reportPath = path.join(directory, 'cleanup-report.json');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        attempts,
        outstanding
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  return reportPath;
}

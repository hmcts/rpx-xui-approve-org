import { expect, test, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { __test__ as accessibilityTest } from '../helpers/accessibility';

test.describe('accessibility evidence publisher', () => {
  const previousEvidenceDir = process.env.PW_A11Y_EVIDENCE_DIR;

  test.afterEach(() => {
    if (previousEvidenceDir === undefined) {
      delete process.env.PW_A11Y_EVIDENCE_DIR;
      return;
    }
    process.env.PW_A11Y_EVIDENCE_DIR = previousEvidenceDir;
  });

  test('writes webapp-style page summary evidence names and manifest entries', async () => {
    const evidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-a11y-evidence-'));
    process.env.PW_A11Y_EVIDENCE_DIR = evidenceDir;

    const testInfo = fakeTestInfo('Booking - Booking UI work access page');
    await accessibilityTest.attachAuditSummary(
      fakePage(),
      testInfo,
      'Booking UI work access page',
      'https://example.test/booking',
      [
        {
          engine: 'axe',
          status: 'issues-found',
          issueCount: 1,
          rules: ['landmark-one-main'],
          message: 'Page must have one main landmark'
        }
      ]
    );

    const expectedBaseName =
      'booking---booking-ui-work-access-page-booking-booking-ui-work-access-page-page-summary';
    const manifest = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'manifest.json'), 'utf8'));
    const html = fs.readFileSync(path.join(evidenceDir, `${expectedBaseName}.html`), 'utf8');

    expect(manifest).toHaveLength(1);
    expect(manifest[0]).toMatchObject({
      engine: 'summary',
      feature: 'Booking',
      pageState: 'Booking UI work access page',
      testTitle: 'Booking - Booking UI work access page',
      attachmentPrefix: 'booking-booking-ui-work-access-page-page-summary',
      htmlFileName: `${expectedBaseName}.html`,
      jsonFileName: `${expectedBaseName}.json`,
      screenshotFileName: `${expectedBaseName}-screenshot.png`,
      violationCount: 1,
      rules: ['axe:landmark-one-main'],
      targets: ['https://example.test/booking']
    });
    expect(fs.existsSync(path.join(evidenceDir, `${expectedBaseName}-screenshot.png`))).toBe(true);
    expect(fs.readFileSync(path.join(evidenceDir, 'index.html'), 'utf8')).toContain(expectedBaseName);
    expect(html).toContain('Accessibility page-state summary');
    expect(html).toContain('class="banner summary-banner"');
    expect(html).toContain('Accessibility tree sample');
    expect(html).toContain('1 total, 1 unexpected');
    expect(html).toContain('data:image/png;base64,');

    fs.rmSync(evidenceDir, { recursive: true, force: true });
  });

  test('does not write page summary screenshots when no accessibility issues are found', async () => {
    const evidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-a11y-evidence-'));
    process.env.PW_A11Y_EVIDENCE_DIR = evidenceDir;

    const testInfo = fakeTestInfo('Booking - Booking UI work access page');
    await accessibilityTest.attachAuditSummary(
      fakePage({
        screenshot: async () => {
          throw new Error('Clean accessibility summaries should not capture screenshots');
        }
      }),
      testInfo,
      'Booking UI work access page',
      'https://example.test/booking',
      [
        {
          engine: 'axe',
          status: 'passed',
          issueCount: 0,
          unexpectedIssueCount: 0,
          rules: []
        }
      ]
    );

    const expectedBaseName =
      'booking---booking-ui-work-access-page-booking-booking-ui-work-access-page-page-summary';
    const manifest = JSON.parse(fs.readFileSync(path.join(evidenceDir, 'manifest.json'), 'utf8'));
    const html = fs.readFileSync(path.join(evidenceDir, `${expectedBaseName}.html`), 'utf8');

    expect(manifest).toHaveLength(1);
    expect(manifest[0]).toMatchObject({
      violationCount: 0,
      status: 'passed',
      screenshotFileName: ''
    });
    expect(fs.existsSync(path.join(evidenceDir, `${expectedBaseName}-screenshot.png`))).toBe(false);
    expect(html).not.toContain('Accessibility evidence screenshot');
    expect(html).not.toContain('data:image/png;base64,');

    fs.rmSync(evidenceDir, { recursive: true, force: true });
  });

  test('formats failing accessibility assertions without raw engine JSON', () => {
    const message = accessibilityTest.formatAccessibilityIssueMessage(
      'Active organisation details view',
      false,
      [
        {
          engine: 'axe',
          status: 'issues-found',
          issueCount: 1,
          unexpectedIssueCount: 1,
          rules: ['definition-list'],
          evidenceFiles: [
            'active-organisation-details-view-axe.json',
            'active-organisation-details-view-axe.html',
            'active-organisation-details-view-axe-highlighted-screenshot.png'
          ]
        }
      ]
    );

    expect(message).toContain('Accessibility issues found for "Active organisation details view".');
    expect(message).toContain('axe: issues-found; 1 issue(s); rules: definition-list');
    expect(message).toContain('Open the accessibility evidence links');
    expect(message).not.toContain('[a11y]');
    expect(message).not.toContain('"engine"');
    expect(message).not.toContain('JSON.stringify');
  });

  test('preserves rule-to-target relationships, incomplete results and engine errors for the handoff', () => {
    const axe = accessibilityTest.buildEvidenceManifestEntry(undefined, 'axe', 'axe', {
      engine: 'axe',
      violations: [
        { id: 'label', nodes: [{ target: ['#name'] }] },
        { id: 'button-name', nodes: [{ target: ['#submit'] }] }
      ],
      incomplete: [{ id: 'color-contrast', nodes: [{ target: ['#help'] }] }]
    }, []);
    expect(axe.findings).toEqual([
      { rule: 'label', targets: ['#name'] },
      { rule: 'button-name', targets: ['#submit'] }
    ]);
    expect(axe.reviewCount).toBe(1);
    expect(axe.reviewRules).toEqual(['color-contrast']);

    const failed = accessibilityTest.buildEvidenceManifestEntry(undefined, 'lighthouse', 'failure', {
      engine: 'lighthouse', error: 'scanner failed'
    }, []);
    expect(failed.status).toBe('error');

    const summary = accessibilityTest.buildEvidenceManifestEntry(undefined, 'summary', 'summary', {
      outcomes: [{ engine: 'lighthouse', status: 'error', issueCount: 0, rules: [] }]
    }, []);
    expect(summary.status).toBe('error');
    const review = accessibilityTest.buildEvidenceManifestEntry(undefined, 'summary', 'review', {
      outcomes: [{ engine: 'axe', status: 'needs-review', issueCount: 0, reviewCount: 1, rules: [] }]
    }, []);
    expect(review.status).toBe('needs-review');
  });

  test('exports produced accessibility evidence without copying raw page content into the AI handoff', async () => {
    const reportDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-a11y-handoff-'));
    try {
      const evidenceDir = path.join(reportDir, 'accessibility-evidence');
      process.env.PW_A11Y_EVIDENCE_DIR = evidenceDir;
      const info = fakeTestInfo('Organisation approval');
      await Promise.all([
        accessibilityTest.attachEvidence(info, 'registration-axe', {
          engine: 'axe', feature: 'Approvals', pageState: 'registration',
          url: 'https://user:password@example.test/cases/1111222233334444?token=secret',
          violations: [{ id: 'label', nodes: [{ target: ['input[aria-label="Jane Smith"]'] }] }],
          incomplete: [{ id: 'color-contrast' }], raw: 'secret page content'
        }, '<html>secret page content</html>'),
        accessibilityTest.attachEvidence(info, 'registration-wave-like', {
          engine: 'wave-like', feature: 'Approvals', pageState: 'registration',
          violations: [{ rule: 'button-name', selector: '#submit' }]
        }, '<html>other evidence</html>')
      ]);
      // Simulate a lost aggregate update from concurrent publishers; individual entries remain intact.
      fs.writeFileSync(path.join(evidenceDir, 'manifest.json'), '[]');
      fs.writeFileSync(path.join(reportDir, 'report.html'), '<html><body>Report</body></html>');
      // The report finalizer reads per-test entries after concurrent publishers finish.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../common/reporters/odhin-report-enhancer.cjs').enhanceGeneratedReport(reportDir, []);
      const pack = JSON.parse(fs.readFileSync(path.join(reportDir, 'accessibility-findings.json'), 'utf8'));
      expect(pack.source.entryCount).toBe(2);
      const index = fs.readFileSync(path.join(evidenceDir, 'index.html'), 'utf8');
      expect(index).toContain('organisation-approval-registration-axe.html');
      expect(index).toContain('organisation-approval-registration-wave-like.html');
      expect(pack.findings.map((finding: { classification: string }) => finding.classification)).toEqual(
        expect.arrayContaining(['reported-violation', 'needs-review'])
      );
      const json = JSON.stringify(pack);
      expect(json).not.toContain('Jane Smith');
      expect(json).not.toContain('secret page content');
      expect(json).not.toContain('1111222233334444');
      expect(json).not.toContain('token=secret');
      expect(fs.readFileSync(path.join(reportDir, 'ACCESSIBILITY_FIX_INSTRUCTIONS.md'), 'utf8')).toContain('untrusted evidence');
    } finally {
      fs.rmSync(reportDir, { recursive: true, force: true });
    }
  });

  test('keeps same-title evidence separate across tests, projects and retries', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ao-a11y-identities-'));
    process.env.PW_A11Y_EVIDENCE_DIR = dir;
    try {
      const info = (testId: string, project: string, retry: number): TestInfo => ({
        ...fakeTestInfo('Duplicate title'), testId, project: { name: project }, retry,
        titlePath: ['file.test.ts', 'same suite', 'Duplicate title']
      }) as unknown as TestInfo;
      await Promise.all([
        info('test-a', 'chrome', 0), info('test-b', 'chrome', 0),
        info('test-a', 'firefox', 0), info('test-a', 'chrome', 1)
      ].map((testInfo, index) => accessibilityTest.attachEvidence(testInfo, 'same-axe', {
        engine: 'axe', violations: [{ id: `rule-${index}`, nodes: [] }]
      }, '<html></html>', [{
        fileName: `${accessibilityTest.evidenceFileBaseName(testInfo, 'same-lighthouse-report')}.html`,
        body: `report-${index}`
      }])));
      const files = fs.readdirSync(dir).filter((name) => name.startsWith('manifest-entry-'));
      expect(files).toHaveLength(4);
      const entries = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')));
      expect(new Set(entries.map((entry) => entry.testIdentity)).size).toBe(4);
      expect(new Set(entries.map((entry) => entry.htmlFileName)).size).toBe(4);
      expect(new Set(entries.map((entry) => entry.reportFileName)).size).toBe(4);
      expect(entries.map((entry) => fs.readFileSync(path.join(dir, entry.reportFileName), 'utf8')).sort())
        .toEqual(['report-0', 'report-1', 'report-2', 'report-3']);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('uses the Playwright title path array to identify the owning feature', () => {
    const testInfo = {
      ...fakeTestInfo('search results'),
      project: { name: 'chromium' },
      titlePath: ['chromium', 'accessibility.test.ts', 'Organisation approvals', 'search results']
    } as unknown as TestInfo;
    const entry = accessibilityTest.buildEvidenceManifestEntry(testInfo, 'axe', 'entry', {
      engine: 'axe', violations: []
    }, []);
    expect(entry.feature).toBe('Organisation approvals');
    testInfo.titlePath = ['chromium', 'accessibility.test.ts', 'search results'];
    expect(accessibilityTest.buildEvidenceManifestEntry(testInfo, 'axe', 'entry', {
      engine: 'axe', violations: []
    }, []).feature).toBe('');
  });
});

function fakeTestInfo(title: string): TestInfo {
  return {
    title,
    attach: async () => undefined
  } as unknown as TestInfo;
}

function fakePage(options: { screenshot?: () => Buffer | Promise<Buffer> } = {}): Page {
  return {
    evaluate: async () => {
      throw new Error('No browser DOM in unit test');
    },
    screenshot: options.screenshot ?? (async () => Buffer.from('fake-png')),
    url: () => 'https://example.test/booking'
  } as unknown as Page;
}

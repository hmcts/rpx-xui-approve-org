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

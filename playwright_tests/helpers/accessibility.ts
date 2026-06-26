import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { LighthouseUtils } from '@hmcts/playwright-common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const A11Y_SCAN_SCOPE = 'main#content, main#main-content, #content, main';
const HIDDEN_TAB_PANEL_SELECTOR = '.govuk-tabs__panel--hidden';
const LIGHTHOUSE_REPORT_DIR = 'test-results';

type AccessibilityEngine = 'axe' | 'wave-like' | 'lighthouse';

type A11yViolation = {
  id: string;
  impact?: string | null;
  description: string;
  nodes: Array<{ target: string[] }>;
};

type WaveLikeViolation = {
  rule: string;
  message: string;
  selector?: string;
  html?: string;
};

type EngineOutcome = {
  engine: AccessibilityEngine;
  status: 'passed' | 'issues-found' | 'error';
  issueCount: number;
  rules: string[];
  message?: string;
  evidenceFiles?: string[];
};

type EvidenceManifestEntry = {
  engine: string;
  feature: string;
  pageState: string;
  testTitle: string;
  attachmentPrefix: string;
  htmlFileName: string;
  jsonFileName: string;
  screenshotFileName: string;
  reportFileName: string;
  violationCount: number;
  status: string;
  summary: string;
  rules: string[];
  targets: string[];
};

const ENGINE_ALIASES: Record<string, AccessibilityEngine> = {
  ax: 'axe',
  axe: 'axe',
  wave: 'wave-like',
  'wave-like': 'wave-like',
  waveLike: 'wave-like',
  lighthouse: 'lighthouse'
};

function formatViolations(violations: A11yViolation[]): string {
  if (!violations.length) {
    return 'No accessibility violations found.';
  }

  return violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target)
        .filter(Boolean)
        .slice(0, 5)
        .join(', ');

      return [
        `id=${violation.id}`,
        `impact=${violation.impact ?? 'unknown'}`,
        `description=${violation.description}`,
        `targets=${targets || 'n/a'}`
      ].join(' | ');
    })
    .join('\n');
}

function resolveAccessibilityEngines(): AccessibilityEngine[] {
  const configured = process.env.A11Y_ENGINES ?? process.env.PLAYWRIGHT_A11Y_ENGINES;
  const defaultEngines: AccessibilityEngine[] = ['axe'];
  if (!configured?.trim()) {
    return defaultEngines;
  }

  const requested = configured
    .split(',')
    .map((engine) => engine.trim())
    .filter(Boolean);

  if (requested.includes('all')) {
    return ['axe', 'wave-like', 'lighthouse'];
  }

  return Array.from(
    new Set(
      requested
        .map((engine) => ENGINE_ALIASES[engine])
        .filter((engine): engine is AccessibilityEngine => Boolean(engine))
    )
  );
}

function isStrictMode(): boolean {
  return ['1', 'true', 'yes', 'on'].includes((process.env.A11Y_STRICT ?? '').trim().toLowerCase());
}

function sanitiseFileName(value: string, fallback = 'accessibility'): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || fallback
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

function evidenceDir(): string {
  return path.resolve(
    process.env.PW_A11Y_EVIDENCE_DIR ??
      path.join(
        process.env.PLAYWRIGHT_REPORT_FOLDER ?? 'functional-output/tests/playwright-accessibility/odhin-report',
        'accessibility-evidence'
      )
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function uniqueStrings(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
    )
  );
}

function resolveEvidenceEngine(name: string, json: Record<string, unknown>): string {
  if (typeof json.engine === 'string' && json.engine.trim()) {
    return json.engine.trim();
  }
  const normalized = name.toLowerCase();
  if (normalized.includes('wave')) {
    return 'wave-like';
  }
  if (normalized.includes('lighthouse')) {
    return 'lighthouse';
  }
  if (normalized.includes('summary')) {
    return 'summary';
  }
  return 'axe';
}

function extractViolationRules(json: Record<string, unknown>): string[] {
  const violations = asRecordArray(json.violations);
  const outcomeRules = asRecordArray(json.outcomes).flatMap((outcome) => outcome.rules ?? []);
  return uniqueStrings([
    ...violations.map((violation) => violation.id ?? violation.rule),
    ...outcomeRules,
    json.rule
  ]);
}

function extractViolationTargets(json: Record<string, unknown>): string[] {
  const violations = asRecordArray(json.violations);
  return uniqueStrings(
    violations.flatMap((violation) => {
      const selector = violation.selector;
      const nodes = asRecordArray(violation.nodes);
      return [
        selector,
        ...nodes.flatMap((node) => Array.isArray(node.target) ? node.target : [])
      ];
    })
  ).slice(0, 20);
}

function resolveViolationCount(json: Record<string, unknown>): number {
  if (typeof json.violationCount === 'number' && Number.isFinite(json.violationCount)) {
    return json.violationCount;
  }
  if (Array.isArray(json.violations)) {
    return json.violations.length;
  }
  const outcomes = asRecordArray(json.outcomes);
  if (outcomes.length) {
    return outcomes.reduce((sum, outcome) => {
      const count = typeof outcome.issueCount === 'number' && Number.isFinite(outcome.issueCount) ? outcome.issueCount : 0;
      return sum + count;
    }, 0);
  }
  return typeof json.error === 'string' && json.error ? 1 : 0;
}

function resolveEvidenceStatus(json: Record<string, unknown>, violationCount: number): string {
  if (typeof json.status === 'string' && json.status.trim()) {
    return json.status.trim();
  }
  const outcomes = asRecordArray(json.outcomes);
  if (outcomes.length) {
    return violationCount > 0 ? 'issues-found' : 'passed';
  }
  return violationCount > 0 ? 'issues-found' : 'passed';
}

function resolveEvidenceSummary(json: Record<string, unknown>, rules: string[]): string {
  if (typeof json.summary === 'string' && json.summary.trim()) {
    return json.summary.trim();
  }
  if (typeof json.error === 'string' && json.error.trim()) {
    return json.error.trim();
  }
  const outcomeMessages = asRecordArray(json.outcomes)
    .map((outcome) => outcome.message)
    .filter((message): message is string => typeof message === 'string' && message.trim().length > 0);
  if (outcomeMessages.length) {
    return outcomeMessages.join('\n');
  }
  return rules.join(', ');
}

function resolveTestTitle(testInfo: TestInfo | undefined, fallback: string): string {
  return testInfo?.title || fallback;
}

function resolveFeatureName(testInfo: TestInfo | undefined): string {
  const titlePath = typeof testInfo?.titlePath === 'function' ? testInfo.titlePath() : [];
  return titlePath.length > 1 ? titlePath.slice(0, -1).join(' / ') : '';
}

function buildEvidenceManifestEntry(
  testInfo: TestInfo | undefined,
  name: string,
  json: unknown,
  extraFiles: Array<{ fileName: string; body: string | Buffer }>
): EvidenceManifestEntry {
  const jsonRecord = asRecord(json);
  const rules = extractViolationRules(jsonRecord);
  const violationCount = resolveViolationCount(jsonRecord);
  const reportFileName =
    typeof jsonRecord.reportFileName === 'string'
      ? jsonRecord.reportFileName
      : extraFiles.find((file) => file.fileName.endsWith('.html'))?.fileName ?? '';

  return {
    engine: resolveEvidenceEngine(name, jsonRecord),
    feature: resolveFeatureName(testInfo),
    pageState: String(jsonRecord.contextLabel ?? ''),
    testTitle: resolveTestTitle(testInfo, name),
    attachmentPrefix: name,
    htmlFileName: `${name}.html`,
    jsonFileName: `${name}.json`,
    screenshotFileName: extraFiles.find((file) => /\.(png|jpe?g|webp)$/i.test(file.fileName))?.fileName ?? '',
    reportFileName,
    violationCount,
    status: resolveEvidenceStatus(jsonRecord, violationCount),
    summary: resolveEvidenceSummary(jsonRecord, rules),
    rules,
    targets: extractViolationTargets(jsonRecord)
  };
}

async function writeEvidenceManifest(dir: string, entry: EvidenceManifestEntry): Promise<void> {
  const entryFileName = `manifest-entry-${sanitiseFileName(`${entry.testTitle}-${entry.attachmentPrefix}`)}.json`;
  await fs.writeFile(path.join(dir, entryFileName), JSON.stringify(entry, null, 2));

  const manifestPath = path.join(dir, 'manifest.json');
  const existing = await fs.readFile(manifestPath, 'utf8')
    .then((value) => JSON.parse(value) as EvidenceManifestEntry[])
    .catch(() => []);
  const retainedEntries = Array.isArray(existing)
    ? existing.filter(
      (candidate) =>
        candidate?.testTitle !== entry.testTitle || candidate?.attachmentPrefix !== entry.attachmentPrefix
    )
    : [];
  await fs.writeFile(manifestPath, JSON.stringify([...retainedEntries, entry], null, 2));
}

async function attachEvidence(
  testInfo: TestInfo | undefined,
  name: string,
  json: unknown,
  html: string,
  extraFiles: Array<{ fileName: string; body: string | Buffer }> = []
): Promise<string[]> {
  const jsonText = JSON.stringify(json, null, 2);
  const attachedFileNames = [`${name}.json`, `${name}.html`, ...extraFiles.map((file) => file.fileName)];

  if (testInfo) {
    await testInfo.attach(`${name}.json`, {
      body: jsonText,
      contentType: 'application/json'
    });
    await testInfo.attach(`${name}.html`, {
      body: html,
      contentType: 'text/html'
    });
    for (const file of extraFiles) {
      await testInfo.attach(file.fileName, {
        body: file.body,
        contentType: file.fileName.endsWith('.html') ? 'text/html' : 'application/octet-stream'
      });
    }
  }

  const dir = evidenceDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${name}.json`), jsonText);
  await fs.writeFile(path.join(dir, `${name}.html`), html);
  for (const file of extraFiles) {
    await fs.writeFile(path.join(dir, file.fileName), file.body);
  }
  await writeEvidenceManifest(dir, buildEvidenceManifestEntry(testInfo, name, json, extraFiles));
  await writeEvidenceIndex(dir);

  return attachedFileNames;
}

async function writeEvidenceIndex(dir: string): Promise<void> {
  const files = await fs.readdir(dir).catch(() => []);
  const rows = files
    .filter((file) => file.endsWith('.html') && file !== 'index.html')
    .sort((left, right) => left.localeCompare(right))
    .map((file) => `<li><a href="./${escapeHtml(file)}">${escapeHtml(file)}</a></li>`)
    .join('\n');

  await fs.writeFile(
    path.join(dir, 'index.html'),
    `<html><head><title>Accessibility Evidence</title></head><body><h1>Accessibility Evidence</h1><ol>${rows}</ol></body></html>`
  );
}

function buildIssuesHtml(title: string, url: string, issues: Array<Record<string, unknown>>): string {
  const rows = issues
    .map((issue) => {
      const rule = String(issue.id ?? issue.rule ?? 'unknown');
      const impact = String(issue.impact ?? '');
      const description = String(issue.description ?? issue.message ?? '');
      const targets = Array.isArray(issue.nodes)
        ? (issue.nodes as Array<{ target?: string[] }>).flatMap((node) => node.target ?? []).join(', ')
        : String(issue.selector ?? '');

      return `
        <tr>
          <td>${escapeHtml(rule)}</td>
          <td>${escapeHtml(impact)}</td>
          <td>${escapeHtml(description)}</td>
          <td><code>${escapeHtml(targets)}</code></td>
        </tr>
      `;
    })
    .join('');

  return `
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0b0c0c; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #b1b4b6; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f3f2f1; }
          code { background: #f3f2f1; padding: 2px 4px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p><strong>URL:</strong> <code>${escapeHtml(url)}</code></p>
        <p><strong>Issue count:</strong> ${issues.length}</p>
        <table>
          <thead><tr><th>Rule</th><th>Impact</th><th>Description</th><th>Target</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No issues found.</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `;
}

async function runAxeEngine(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<EngineOutcome> {
  const analysis = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .include(A11Y_SCAN_SCOPE)
    .exclude(HIDDEN_TAB_PANEL_SELECTOR)
    .analyze();
  const violations = analysis.violations as A11yViolation[];
  const evidenceName = `${sanitiseFileName(contextLabel)}-axe-accessibility`;
  const evidenceFiles = await attachEvidence(
    testInfo,
    evidenceName,
    { url: page.url(), engine: 'axe', violations },
    buildIssuesHtml(`[axe] ${contextLabel}`, page.url(), violations as unknown as Array<Record<string, unknown>>)
  );

  return {
    engine: 'axe',
    status: violations.length ? 'issues-found' : 'passed',
    issueCount: violations.length,
    rules: violations.map((violation) => violation.id),
    message: formatViolations(violations),
    evidenceFiles
  };
}

async function collectWaveLikeAccessibilityViolations(page: Page): Promise<WaveLikeViolation[]> {
  return page.evaluate<WaveLikeViolation[]>(() => {
    const visible = (element: Element): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      if (element instanceof HTMLInputElement && element.type === 'hidden') {
        return false;
      }
      const style = window.getComputedStyle(element);
      return style.visibility !== 'hidden' && style.display !== 'none' && element.getClientRects().length > 0;
    };
    const text = (element: Element | null): string => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const selectorFor = (element: Element): string => {
      const id = element.getAttribute('id');
      if (id) {
        return `#${CSS.escape(id)}`;
      }
      const testId = element.getAttribute('data-testid') ?? element.getAttribute('data-test-id');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }
      return element.tagName.toLowerCase();
    };
    const labelledByText = (element: Element): string =>
      (element.getAttribute('aria-labelledby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => text(document.getElementById(id)))
        .filter(Boolean)
        .join(' ');
    const controlLabels = (element: Element): string => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLButtonElement ||
        element instanceof HTMLOutputElement
      ) {
        return Array.from(element.labels ?? [])
          .map((label) => text(label))
          .filter(Boolean)
          .join(' ');
      }
      const id = element.getAttribute('id');
      if (!id) {
        return '';
      }
      return Array.from(document.querySelectorAll(`label[for="${CSS.escape(id)}"]`))
        .map((label) => text(label))
        .filter(Boolean)
        .join(' ');
    };
    const accessibleName = (element: Element): string => {
      const imageAlt = Array.from(element.querySelectorAll('img'))
        .map((image) => image.getAttribute('alt')?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      return [
        element.getAttribute('aria-label')?.trim() ?? '',
        labelledByText(element),
        controlLabels(element),
        element.getAttribute('title')?.trim() ?? '',
        element.getAttribute('placeholder')?.trim() ?? '',
        element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type) ? element.value.trim() : '',
        imageAlt,
        text(element)
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    };
    const add = (violations: WaveLikeViolation[], rule: string, message: string, element?: Element) => {
      violations.push({
        rule,
        message,
        ...(element ? { selector: selectorFor(element), html: element.outerHTML.slice(0, 500) } : {})
      });
    };

    const violations: WaveLikeViolation[] = [];
    if (!document.documentElement.getAttribute('lang')?.trim()) {
      add(violations, 'document-language', 'The html element should declare a lang attribute.');
    }
    if (!document.title.trim() || /^untitled$/i.test(document.title.trim())) {
      add(violations, 'document-title', 'The page should have a meaningful document title.');
    }

    const mainLandmarks = Array.from(document.querySelectorAll('main, [role="main"]')).filter(visible);
    if (mainLandmarks.length !== 1) {
      add(violations, 'main-landmark', `Expected exactly one visible main landmark, found ${mainLandmarks.length}.`);
    }

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(visible);
    const h1s = headings.filter((heading) => heading.tagName.toLowerCase() === 'h1');
    if (h1s.length !== 1) {
      add(violations, 'h1-count', `Expected exactly one visible h1, found ${h1s.length}.`, h1s[0]);
    }
    headings.reduce((previousLevel, heading) => {
      const level = Number(heading.tagName.slice(1));
      if (previousLevel > 0 && level > previousLevel + 1) {
        add(violations, 'heading-order', `Heading level jumps from h${previousLevel} to h${level}.`, heading);
      }
      return level;
    }, 0);

    const ids = new Map<string, Element[]>();
    document.querySelectorAll('[id]').forEach((element) => {
      const id = element.getAttribute('id') ?? '';
      ids.set(id, [...(ids.get(id) ?? []), element]);
    });
    ids.forEach((elements, id) => {
      if (id && elements.length > 1) {
        add(violations, 'duplicate-id', `Duplicate id "${id}" appears ${elements.length} times.`, elements[0]);
      }
    });

    Array.from(document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [role="link"]'))
      .filter(visible)
      .filter((element) => !accessibleName(element))
      .forEach((element) =>
        add(violations, 'accessible-name', 'Interactive controls and links should expose an accessible name.', element)
      );

    Array.from(document.querySelectorAll('img'))
      .filter(visible)
      .filter((image) => {
        const role = image.getAttribute('role')?.trim().toLowerCase() ?? '';
        return role !== 'presentation' && role !== 'none' && image.getAttribute('alt') === null;
      })
      .forEach((image) => add(violations, 'image-alt', 'Images should have alt text or be marked decorative.', image));

    Array.from(document.querySelectorAll('fieldset'))
      .filter(visible)
      .filter((fieldset) => !text(fieldset.querySelector('legend')))
      .forEach((fieldset) =>
        add(violations, 'fieldset-legend', 'Fieldsets should expose a visible legend for grouped controls.', fieldset)
      );

    Array.from(document.querySelectorAll('table'))
      .filter(visible)
      .filter((table) => table.querySelectorAll('td').length > 0)
      .filter((table) => table.querySelectorAll('th, [role="columnheader"], [role="rowheader"]').length === 0)
      .forEach((table) => add(violations, 'table-headers', 'Data tables should expose row or column headers.', table));

    Array.from(document.querySelectorAll('.govuk-error-summary a[href]')).forEach((link) => {
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('#')) {
        add(violations, 'error-summary-target', 'Error summary links should target controls on the same page.', link);
        return;
      }
      if (!document.getElementById(decodeURIComponent(href.slice(1)))) {
        add(violations, 'error-summary-target', `Error summary link target "${href}" does not exist.`, link);
      }
    });

    return violations;
  });
}

async function runWaveLikeEngine(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<EngineOutcome> {
  const violations = await collectWaveLikeAccessibilityViolations(page);
  const evidenceName = `${sanitiseFileName(contextLabel)}-wave-like-accessibility`;
  const evidenceFiles = await attachEvidence(
    testInfo,
    evidenceName,
    { url: page.url(), engine: 'wave-like', violations },
    buildIssuesHtml(`[wave-like] ${contextLabel}`, page.url(), violations as unknown as Array<Record<string, unknown>>)
  );

  return {
    engine: 'wave-like',
    status: violations.length ? 'issues-found' : 'passed',
    issueCount: violations.length,
    rules: Array.from(new Set(violations.map((violation) => violation.rule))),
    evidenceFiles
  };
}

async function listLighthouseReports(): Promise<string[]> {
  const entries = await fs.readdir(LIGHTHOUSE_REPORT_DIR).catch(() => []);
  return entries
    .filter((entry) => /^lighthouse-report-\d+\.html$/.test(entry))
    .map((entry) => path.resolve(LIGHTHOUSE_REPORT_DIR, entry));
}

async function findGeneratedLighthouseReport(beforeReports: Set<string>): Promise<string | undefined> {
  const reports = await listLighthouseReports();
  const newReports = reports.filter((report) => !beforeReports.has(report));
  const candidates = newReports.length > 0 ? newReports : reports;
  const stats = await Promise.all(
    candidates.map(async (report) => ({
      report,
      mtimeMs: (await fs.stat(report)).mtimeMs
    }))
  );

  return stats.sort((left, right) => right.mtimeMs - left.mtimeMs)[0]?.report;
}

async function runLighthouseEngine(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<EngineOutcome> {
  const port = Number.parseInt(process.env.PW_LIGHTHOUSE_PORT ?? '9222', 10);
  const threshold = Number.parseInt(process.env.PW_LIGHTHOUSE_ACCESSIBILITY_THRESHOLD ?? '90', 10);
  const beforeReports = new Set(await listLighthouseReports());

  try {
    await new LighthouseUtils(page, port).audit({
      performance: 0,
      accessibility: threshold,
      'best-practices': 0
    });
    const reportPath = await findGeneratedLighthouseReport(beforeReports);
    const reportFileName = reportPath ? `${sanitiseFileName(contextLabel)}-lighthouse-report.html` : undefined;
    const reportBody = reportPath ? await fs.readFile(reportPath) : undefined;
    const evidenceName = `${sanitiseFileName(contextLabel)}-lighthouse-accessibility`;
    const evidenceFiles = await attachEvidence(
      testInfo,
      evidenceName,
      {
        url: page.url(),
        engine: 'lighthouse',
        accessibilityThreshold: threshold,
        reportFileName
      },
      buildLighthouseSummaryHtml(contextLabel, page.url(), threshold, reportFileName),
      reportFileName && reportBody ? [{ fileName: reportFileName, body: reportBody }] : []
    );

    return {
      engine: 'lighthouse',
      status: 'passed',
      issueCount: 0,
      rules: ['accessibility-threshold'],
      evidenceFiles
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const evidenceName = `${sanitiseFileName(contextLabel)}-lighthouse-accessibility`;
    const evidenceFiles = await attachEvidence(
      testInfo,
      evidenceName,
      {
        url: page.url(),
        engine: 'lighthouse',
        accessibilityThreshold: threshold,
        error: message
      },
      buildLighthouseSummaryHtml(contextLabel, page.url(), threshold, undefined, message)
    );

    return {
      engine: 'lighthouse',
      status: 'error',
      issueCount: 1,
      rules: ['accessibility-threshold'],
      message,
      evidenceFiles
    };
  }
}

function buildLighthouseSummaryHtml(
  contextLabel: string,
  url: string,
  threshold: number,
  reportFileName?: string,
  error?: string
): string {
  return `
    <html>
      <head><title>Lighthouse Accessibility Evidence</title></head>
      <body>
        <h1>Lighthouse Accessibility Evidence</h1>
        <p><strong>State:</strong> ${escapeHtml(contextLabel)}</p>
        <p><strong>URL:</strong> <code>${escapeHtml(url)}</code></p>
        <p><strong>Accessibility threshold:</strong> ${threshold}</p>
        ${reportFileName ? `<p><a href="./${escapeHtml(reportFileName)}">Open full Lighthouse report</a></p>` : ''}
        ${error ? `<p><strong>Error:</strong> ${escapeHtml(error)}</p>` : ''}
      </body>
    </html>
  `;
}

async function attachAuditSummary(
  testInfo: TestInfo | undefined,
  contextLabel: string,
  url: string,
  outcomes: EngineOutcome[]
): Promise<void> {
  const strict = isStrictMode();
  const body = {
    contextLabel,
    url,
    strict,
    outcomes
  };
  const rows = outcomes
    .map(
      (outcome) => `
        <tr>
          <td>${escapeHtml(outcome.engine)}</td>
          <td>${escapeHtml(outcome.status)}</td>
          <td>${outcome.issueCount}</td>
          <td>${escapeHtml(outcome.rules.join(', ') || 'none')}</td>
          <td>${escapeHtml(outcome.message ?? '')}</td>
        </tr>
      `
    )
    .join('');
  const html = `
    <html>
      <head><title>Accessibility Audit Summary</title></head>
      <body>
        <h1>Accessibility Audit Summary</h1>
        <p><strong>State:</strong> ${escapeHtml(contextLabel)}</p>
        <p><strong>URL:</strong> <code>${escapeHtml(url)}</code></p>
        <p><strong>Strict mode:</strong> ${strict ? 'on' : 'off'}</p>
        <table>
          <thead><tr><th>Engine</th><th>Status</th><th>Issues</th><th>Rules</th><th>Message</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  await attachEvidence(testInfo, `${sanitiseFileName(contextLabel)}-accessibility-summary`, body, html);
}

export async function accessibilityCheck(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<void> {
  await expect(page.locator('main, #main-content, #content').first()).toBeVisible({ timeout: 30_000 });

  const engines = resolveAccessibilityEngines();
  const outcomes: EngineOutcome[] = [];

  if (engines.includes('axe')) {
    outcomes.push(await runAxeEngine(page, contextLabel, testInfo));
  }

  if (engines.includes('wave-like')) {
    outcomes.push(await runWaveLikeEngine(page, contextLabel, testInfo));
  }

  if (engines.includes('lighthouse')) {
    outcomes.push(await runLighthouseEngine(page, contextLabel, testInfo));
  }

  await attachAuditSummary(testInfo, contextLabel, page.url(), outcomes);

  const issues = outcomes.filter((outcome) => outcome.status !== 'passed' && outcome.issueCount > 0);
  const strictMode = isStrictMode();
  const issueMessage = [
    `[a11y] ${contextLabel}`,
    strictMode
      ? 'A11Y_STRICT is enabled, so accessibility issues are blocking.'
      : 'A11Y_STRICT is disabled; accessibility issues are recorded in report evidence only.',
    JSON.stringify(outcomes, null, 2)
  ].join('\n');

  if (!strictMode) {
    if (issues.length > 0) {
      testInfo?.annotations.push({
        type: 'accessibility',
        description: `${contextLabel}: ${issues.length} accessibility engine(s) reported issues. See attached evidence.`
      });
      process.stdout.write(`${issueMessage}\n`);
    }
    return;
  }

  expect(
    issues,
    issueMessage
  ).toEqual([]);
}

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { LighthouseUtils } from '@hmcts/playwright-common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const A11Y_SCAN_SCOPE = 'main#content, main#main-content, #content, main';
const HIDDEN_TAB_PANEL_SELECTOR = '.govuk-tabs__panel--hidden';
const LIGHTHOUSE_REPORT_DIR = 'test-results';

type AccessibilityEngine = 'axe' | 'wave-like' | 'screen-reader' | 'lighthouse';

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

type ScreenReaderLikeViolation = WaveLikeViolation;

type ScreenReaderLikeEvidence = {
  feature: string;
  pageState: string;
  url: string;
  engine: 'screen-reader';
  violations: ScreenReaderLikeViolation[];
  snapshot: PageSnapshot;
};

type IssueMarker = {
  rule: string;
  selector?: string;
};

type EngineOutcome = {
  engine: AccessibilityEngine;
  status: 'passed' | 'issues-found' | 'error';
  issueCount: number;
  knownIssueCount?: number;
  unexpectedIssueCount?: number;
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

type PageSnapshot = {
  title: string;
  url: string;
  headings: Array<{ level: number; text: string }>;
  landmarks: Array<{ role: string; name: string; selector: string }>;
  keyboardOrder: Array<{ type: string; name: string; selector: string; tabIndex: number }>;
  liveRegions: Array<{ role: string; name: string; selector: string }>;
  axTree: Array<{ role: string; name: string }>;
};

const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l8hS+QAAAABJRU5ErkJggg==',
  'base64'
);

const ENGINE_ALIASES: Record<string, AccessibilityEngine> = {
  ax: 'axe',
  axe: 'axe',
  wave: 'wave-like',
  'wave-like': 'wave-like',
  waveLike: 'wave-like',
  'screen-reader': 'screen-reader',
  screenreader: 'screen-reader',
  screenReader: 'screen-reader',
  sr: 'screen-reader',
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
  const defaultEngines: AccessibilityEngine[] = ['axe', 'wave-like', 'screen-reader'];
  if (!configured?.trim()) {
    return defaultEngines;
  }

  const requested = configured
    .split(',')
    .map((engine) => engine.trim())
    .filter(Boolean);

  if (requested.includes('all')) {
    return ['axe', 'wave-like', 'screen-reader', 'lighthouse'];
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

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('`', '&#96;');
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
  const outcomeRules = asRecordArray(json.outcomes).flatMap((outcome) => {
    const engine = typeof outcome.engine === 'string' && outcome.engine ? `${outcome.engine}:` : '';
    const rules = Array.isArray(outcome.rules) ? outcome.rules : [];
    return rules.map((rule) => `${engine}${String(rule)}`);
  });
  return uniqueStrings([
    ...violations.map((violation) => violation.id ?? violation.rule),
    ...outcomeRules,
    json.rule
  ]);
}

function extractViolationTargets(json: Record<string, unknown>): string[] {
  const violations = asRecordArray(json.violations);
  const targets = uniqueStrings(
    violations.flatMap((violation) => {
      const selector = violation.selector;
      const nodes = asRecordArray(violation.nodes);
      return [
        selector,
        ...nodes.flatMap((node) => Array.isArray(node.target) ? node.target : [])
      ];
    })
  ).slice(0, 20);
  if (targets.length) {
    return targets;
  }
  return typeof json.url === 'string' && json.url ? [json.url] : [];
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
      const unexpectedCount =
        typeof outcome.unexpectedIssueCount === 'number' && Number.isFinite(outcome.unexpectedIssueCount)
          ? outcome.unexpectedIssueCount
          : undefined;
      const issueCount = typeof outcome.issueCount === 'number' && Number.isFinite(outcome.issueCount) ? outcome.issueCount : 0;
      const count = unexpectedCount ?? issueCount;
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
  const outcomes = asRecordArray(json.outcomes);
  if (outcomes.length) {
    const unexpectedCount = outcomes.reduce((sum, outcome) => {
      const count =
        typeof outcome.unexpectedIssueCount === 'number' && Number.isFinite(outcome.unexpectedIssueCount)
          ? outcome.unexpectedIssueCount
          : typeof outcome.issueCount === 'number' && Number.isFinite(outcome.issueCount)
            ? outcome.issueCount
            : 0;
      return sum + count;
    }, 0);
    return `${outcomes.length} engine(s), ${unexpectedCount} unexpected issue(s)`;
  }
  if (outcomeMessages.length) {
    return outcomeMessages.join('\n');
  }
  return rules.join(', ');
}

function resolveTestTitle(testInfo: TestInfo | undefined, fallback: string): string {
  return testInfo?.title || fallback;
}

function resolveFeatureName(testInfo: TestInfo | undefined): string {
  const titlePathFn = (testInfo as unknown as { titlePath?: () => string[] } | undefined)?.titlePath;
  const titlePath = typeof titlePathFn === 'function' ? titlePathFn() : [];
  const title = testInfo?.title ?? '';
  const featureFromTitlePath = titlePath
    .filter((part) => part && part !== title && !/\.(spec|test)\.[tj]s$/i.test(part) && !/[\\/]/.test(part))
    .slice(-1)[0];
  if (featureFromTitlePath) {
    return featureFromTitlePath;
  }

  const titlePrefix = title.match(/^(.+?)\s+-\s+.+$/)?.[1]?.trim();
  return titlePrefix ?? '';
}

function evidencePrefix(testInfo: TestInfo | undefined, pageState: string): string {
  return [resolveFeatureName(testInfo), pageState]
    .map((part) => sanitiseFileName(part))
    .filter(Boolean)
    .join('-');
}

function evidenceMetadata(testInfo: TestInfo | undefined, pageState: string): { feature: string; pageState: string } {
  return {
    feature: resolveFeatureName(testInfo) || 'accessibility',
    pageState
  };
}

function buildEvidenceManifestEntry(
  testInfo: TestInfo | undefined,
  attachmentPrefix: string,
  fileBaseName: string,
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
    engine: resolveEvidenceEngine(attachmentPrefix, jsonRecord),
    feature: typeof jsonRecord.feature === 'string' ? jsonRecord.feature : resolveFeatureName(testInfo),
    pageState: String(jsonRecord.pageState ?? jsonRecord.contextLabel ?? ''),
    testTitle: resolveTestTitle(testInfo, attachmentPrefix),
    attachmentPrefix,
    htmlFileName: `${fileBaseName}.html`,
    jsonFileName: `${fileBaseName}.json`,
    screenshotFileName: extraFiles.find((file) => /\.(png|jpe?g|webp)$/i.test(file.fileName))?.fileName ?? '',
    reportFileName,
    violationCount,
    status: resolveEvidenceStatus(jsonRecord, violationCount),
    summary: resolveEvidenceSummary(jsonRecord, rules),
    rules,
    targets: extractViolationTargets(jsonRecord)
  };
}

async function writeEvidenceManifest(dir: string, fileBaseName: string, entry: EvidenceManifestEntry): Promise<void> {
  const entryFileName = `manifest-entry-${fileBaseName}.json`;
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

function evidenceFileBaseName(testInfo: TestInfo | undefined, attachmentPrefix: string): string {
  const testTitlePrefix = sanitiseFileName(testInfo?.title ?? '');
  return testTitlePrefix ? `${testTitlePrefix}-${attachmentPrefix}` : attachmentPrefix;
}

async function attachEvidence(
  testInfo: TestInfo | undefined,
  name: string,
  json: unknown,
  html: string,
  extraFiles: Array<{ fileName: string; body: string | Buffer }> = []
): Promise<string[]> {
  const fileBaseName = evidenceFileBaseName(testInfo, name);
  const jsonText = JSON.stringify(json, null, 2);
  const attachedFileNames = [`${fileBaseName}.json`, `${fileBaseName}.html`, ...extraFiles.map((file) => file.fileName)];

  if (testInfo) {
    await testInfo.attach(`${fileBaseName}.json`, {
      body: jsonText,
      contentType: 'application/json'
    });
    await testInfo.attach(`${fileBaseName}.html`, {
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
  await fs.writeFile(path.join(dir, `${fileBaseName}.json`), jsonText);
  await fs.writeFile(path.join(dir, `${fileBaseName}.html`), html);
  for (const file of extraFiles) {
    await fs.writeFile(path.join(dir, file.fileName), file.body);
  }
  await writeEvidenceManifest(dir, fileBaseName, buildEvidenceManifestEntry(testInfo, name, fileBaseName, json, extraFiles));
  await writeEvidenceIndex(dir);

  return attachedFileNames;
}

async function writeEvidenceIndex(dir: string): Promise<void> {
  const manifest = await fs.readFile(path.join(dir, 'manifest.json'), 'utf8')
    .then((value) => JSON.parse(value) as EvidenceManifestEntry[])
    .catch(() => []);
  const rows = (Array.isArray(manifest) ? manifest : [])
    .sort((left, right) => left.testTitle.localeCompare(right.testTitle) || left.attachmentPrefix.localeCompare(right.attachmentPrefix))
    .map(
      (entry) => `
        <li>
          <a class="issue-link" href="./${escapeAttribute(entry.htmlFileName)}">${escapeHtml(entry.testTitle)}</a>
          <p>${escapeHtml(entry.feature || 'accessibility')} / ${escapeHtml(entry.pageState || entry.engine)}</p>
          <p>${entry.violationCount} ${escapeHtml(entry.engine)} issue(s): ${escapeHtml(entry.rules.join(', ') || 'none')}</p>
          ${entry.screenshotFileName ? `<a href="./${escapeAttribute(entry.screenshotFileName)}">screenshot</a> | ` : ''}
          <a href="./${escapeAttribute(entry.jsonFileName)}">JSON evidence</a>
          ${entry.reportFileName ? ` | <a href="./${escapeAttribute(entry.reportFileName)}">native report</a>` : ''}
        </li>
      `
    )
    .join('');

  await fs.writeFile(
    path.join(dir, 'index.html'),
    `
      <html>
        <head>
          <title>Accessibility Evidence</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0b0c0c; }
            .banner { background: #1d70b8; color: #fff; padding: 16px; margin-bottom: 24px; }
            .issue-link { font-weight: bold; font-size: 18px; }
            li { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="banner">
            <h1>ACCESSIBILITY EVIDENCE</h1>
            <p>Open each item for engine-specific findings, screenshots, JSON, and native reports where available.</p>
          </div>
          <ol>${rows}</ol>
        </body>
      </html>
    `
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

async function collectPageSnapshot(page: Page): Promise<PageSnapshot> {
  const fallback = {
    title: '',
    headings: [],
    landmarks: [],
    keyboardOrder: [],
    liveRegions: []
  };
  const domSnapshot = await page.evaluate<Omit<PageSnapshot, 'url' | 'axTree'>>(() => {
    const visible = (element: Element): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      const style = window.getComputedStyle(element);
      return style.visibility !== 'hidden' && style.display !== 'none' && element.getClientRects().length > 0;
    };
    const text = (element: Element | null): string => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const selectorFor = (element: Element): string => {
      const id = element.getAttribute('id');
      if (id) {
        return `#${id}`;
      }
      const testId = element.getAttribute('data-testid') ?? element.getAttribute('data-test-id');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }
      return element.tagName.toLowerCase();
    };
    const referencedText = (element: Element, attribute: string): string =>
      (element.getAttribute(attribute) ?? '')
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
          .map(text)
          .filter(Boolean)
          .join(' ');
      }
      return '';
    };
    const accessibleName = (element: Element): string =>
      [
        element.getAttribute('aria-label')?.trim() ?? '',
        referencedText(element, 'aria-labelledby'),
        controlLabels(element),
        element.getAttribute('title')?.trim() ?? '',
        element.getAttribute('placeholder')?.trim() ?? '',
        element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type) ? element.value.trim() : '',
        text(element)
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter(visible)
      .map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: text(heading).slice(0, 180)
      }));
    const landmarks = Array.from(document.querySelectorAll('header, nav, main, aside, footer, [role]'))
      .filter(visible)
      .map((landmark) => ({
        role: landmark.getAttribute('role') || landmark.tagName.toLowerCase(),
        name: (landmark.getAttribute('aria-label') || accessibleName(landmark)).slice(0, 180),
        selector: selectorFor(landmark)
      }))
      .filter((landmark) =>
        ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'header', 'nav', 'aside', 'footer'].includes(
          landmark.role
        )
      );
    const keyboardOrder = Array.from(
      document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [role="button"], [role="link"]')
    )
      .filter(visible)
      .filter((element) => element.getAttribute('tabindex') !== '-1')
      .map((element) => ({
        type:
          element instanceof HTMLInputElement
            ? `${element.type || 'input'} input`
            : element.tagName.toLowerCase() === 'a'
              ? 'link'
              : element.tagName.toLowerCase(),
        name: accessibleName(element).slice(0, 180) || '(no accessible name)',
        selector: selectorFor(element),
        tabIndex: Number(element.getAttribute('tabindex') ?? '0')
      }));
    const liveRegions = Array.from(document.querySelectorAll('[role="status"], [role="alert"], [aria-live]'))
      .filter(visible)
      .map((region) => ({
        role: region.getAttribute('role') || `aria-live:${region.getAttribute('aria-live') ?? 'unknown'}`,
        name: accessibleName(region).slice(0, 180),
        selector: selectorFor(region)
      }));

    return {
      title: document.title.trim(),
      headings,
      landmarks,
      keyboardOrder,
      liveRegions
    };
  }).catch(() => fallback);

  return {
    ...domSnapshot,
    url: page.url(),
    axTree: await collectChromiumAxTree(page)
  };
}

async function collectChromiumAxTree(page: Page): Promise<Array<{ role: string; name: string }>> {
  try {
    const session = await page.context().newCDPSession(page);
    const response = (await session.send('Accessibility.getFullAXTree')) as {
      nodes?: Array<{ role?: { value?: string }; name?: { value?: string } }>;
    };
    await session.detach();
    return (response.nodes ?? [])
      .map((node) => ({
        role: String(node.role?.value ?? ''),
        name: String(node.name?.value ?? '')
      }))
      .filter((node) => node.role || node.name)
      .slice(0, 80);
  } catch {
    return [];
  }
}

async function markPageSummaryFindings(page: Page, findings: string[]): Promise<() => Promise<void>> {
  await page.evaluate((items) => {
    const overlayRoot = document.createElement('div');
    overlayRoot.setAttribute('data-testid', 'accessibility-page-summary-overlays');
    overlayRoot.style.position = 'absolute';
    overlayRoot.style.left = '0';
    overlayRoot.style.top = '0';
    overlayRoot.style.width = '0';
    overlayRoot.style.height = '0';
    overlayRoot.style.zIndex = '2147483647';
    overlayRoot.style.pointerEvents = 'none';
    document.body.appendChild(overlayRoot);

    const banner = document.createElement('div');
    banner.style.position = 'absolute';
    banner.style.left = `${window.scrollX + 16}px`;
    banner.style.top = `${window.scrollY + 16}px`;
    banner.style.maxWidth = '820px';
    banner.style.background = '#d4351c';
    banner.style.color = '#fff';
    banner.style.border = '6px solid #ffdd00';
    banner.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
    banner.style.font = 'bold 18px Arial, sans-serif';
    banner.style.padding = '12px 16px';
    banner.textContent = `Accessibility finding(s): ${items.slice(0, 5).join('; ')}${items.length > 5 ? '; ...' : ''}`;
    overlayRoot.appendChild(banner);
  }, findings);

  return async () => {
    await page.evaluate(() => {
      document.querySelector('[data-testid="accessibility-page-summary-overlays"]')?.remove();
    }).catch(() => undefined);
  };
}

async function capturePageSummaryScreenshot(page: Page, findings: string[]): Promise<Buffer> {
  let cleanup: (() => Promise<void>) | undefined;
  try {
    if (findings.length) {
      cleanup = await markPageSummaryFindings(page, findings).catch(() => undefined);
    }
    return await page.screenshot({ fullPage: true });
  } catch {
    return TRANSPARENT_PIXEL;
  } finally {
    await cleanup?.();
  }
}

async function markIssueSelectorsOnPage(page: Page, markers: IssueMarker[]): Promise<() => Promise<void>> {
  await page.evaluate((items) => {
    const overlayRoot = document.createElement('div');
    overlayRoot.setAttribute('data-testid', 'accessibility-issue-overlays');
    overlayRoot.style.position = 'absolute';
    overlayRoot.style.left = '0';
    overlayRoot.style.top = '0';
    overlayRoot.style.width = '0';
    overlayRoot.style.height = '0';
    overlayRoot.style.zIndex = '2147483647';
    overlayRoot.style.pointerEvents = 'none';
    document.body.appendChild(overlayRoot);

    const unresolved: Array<{ index: number; rule: string; selector?: string }> = [];

    items.forEach((item, index) => {
      if (!item.selector) {
        unresolved.push({ ...item, index });
        return;
      }
      let element: Element | null = null;
      try {
        element = document.querySelector(item.selector);
      } catch {
        element = null;
      }
      if (!element) {
        unresolved.push({ ...item, index });
        return;
      }

      const rect = element.getBoundingClientRect();
      const marker = document.createElement('div');
      marker.style.position = 'absolute';
      marker.style.left = `${rect.left + window.scrollX}px`;
      marker.style.top = `${rect.top + window.scrollY}px`;
      marker.style.width = `${Math.max(rect.width, 2)}px`;
      marker.style.height = `${Math.max(rect.height, 2)}px`;
      marker.style.outline = '6px solid #4c2c92';
      marker.style.background = 'rgba(29, 112, 184, 0.18)';
      marker.style.boxSizing = 'border-box';

      const label = document.createElement('div');
      label.textContent = `${index + 1} ${item.rule}`;
      label.style.position = 'absolute';
      label.style.left = '0';
      label.style.top = '-32px';
      label.style.background = '#4c2c92';
      label.style.color = '#fff';
      label.style.font = 'bold 16px Arial, sans-serif';
      label.style.padding = '4px 8px';
      label.style.whiteSpace = 'nowrap';

      marker.appendChild(label);
      overlayRoot.appendChild(marker);
    });

    if (unresolved.length > 0) {
      const banner = document.createElement('div');
      banner.style.position = 'absolute';
      banner.style.left = `${window.scrollX + 16}px`;
      banner.style.top = `${window.scrollY + 16}px`;
      banner.style.maxWidth = '760px';
      banner.style.background = '#4c2c92';
      banner.style.color = '#fff';
      banner.style.border = '6px solid #ffdd00';
      banner.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
      banner.style.font = 'bold 18px Arial, sans-serif';
      banner.style.padding = '12px 16px';
      banner.textContent = `Page-level accessibility finding(s): ${unresolved
        .slice(0, 5)
        .map((item) => `${item.index + 1} ${item.rule}${item.selector ? ` (${item.selector})` : ''}`)
        .join('; ')}${unresolved.length > 5 ? '; ...' : ''}`;
      overlayRoot.appendChild(banner);
    }
  }, markers);

  return async () => {
    await page.evaluate(() => {
      document.querySelector('[data-testid="accessibility-issue-overlays"]')?.remove();
    }).catch(() => undefined);
  };
}

async function captureHighlightedIssueScreenshot(page: Page, markers: IssueMarker[]): Promise<Buffer> {
  let cleanup: (() => Promise<void>) | undefined;
  try {
    if (markers.length) {
      cleanup = await markIssueSelectorsOnPage(page, markers).catch(() => undefined);
    }
    return await page.screenshot({ fullPage: true });
  } catch {
    return TRANSPARENT_PIXEL;
  } finally {
    await cleanup?.();
  }
}

function axeIssueMarkers(violations: A11yViolation[]): IssueMarker[] {
  return violations.flatMap((violation) =>
    violation.nodes.flatMap((node) =>
      (node.target ?? []).slice(0, 3).map((selector) => ({
        rule: violation.id,
        selector
      }))
    )
  );
}

function waveIssueMarkers(violations: WaveLikeViolation[]): IssueMarker[] {
  return violations.map((violation) => ({
    rule: violation.rule,
    selector: violation.selector
  }));
}

function buildPageSummaryHtml(summary: {
  feature: string;
  pageState: string;
  url: string;
  strict: boolean;
  outcomes: EngineOutcome[];
  snapshot: PageSnapshot;
}, screenshot: Buffer): string {
  const screenshotDataUrl = `data:image/png;base64,${(screenshot.length ? screenshot : TRANSPARENT_PIXEL).toString('base64')}`;
  const outcomeCards = summary.outcomes
    .map(
      (outcome) => `
        <section class="metric ${outcome.status === 'passed' ? 'pass' : 'warn'}">
          <strong>${escapeHtml(outcome.engine)}</strong>
          <span>${escapeHtml(outcome.status)}</span>
          <small>${outcome.issueCount} total, ${outcome.unexpectedIssueCount ?? outcome.issueCount} unexpected</small>
        </section>
      `
    )
    .join('');

  return buildEvidenceShell({
    title: 'Accessibility page-state summary',
    bannerClass: 'banner summary-banner',
    summary: `${summary.feature} / ${summary.pageState}`,
    snapshot: summary.snapshot,
    screenshotDataUrl,
    body: `
      <section class="summary-card">
        <h2>Engine summary</h2>
        <p><strong>URL:</strong> <code>${escapeHtml(summary.url)}</code></p>
        <p><strong>Strict mode:</strong> ${summary.strict ? 'on' : 'off'}</p>
        <div class="metrics">${outcomeCards}</div>
      </section>
    `
  });
}

function buildEvidenceShell(context: {
  title: string;
  bannerClass: string;
  summary: string;
  snapshot: PageSnapshot;
  screenshotDataUrl: string;
  body: string;
}): string {
  const axTreeItems =
    context.snapshot.axTree
      .slice(0, 30)
      .map((node) => `<li><span class="token">${escapeHtml(node.role || '-')}</span>${escapeHtml(node.name || '(unnamed)')}</li>`)
      .join('') || '<li>Chromium accessibility tree was not available.</li>';

  return `
    <html>
      <head>
        <title>${escapeHtml(context.title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; color: #0b0c0c; background: #f3f2f1; }
          .layout { display: grid; grid-template-columns: minmax(300px, 380px) 1fr; min-height: 100vh; }
          .panel { background: #e6f0f7; border-right: 1px solid #b1b4b6; padding: 14px; position: sticky; top: 0; height: 100vh; overflow: auto; }
          .panel h1 { font-size: 22px; margin: 0 0 12px; }
          .scorecard { background: #fff; border-left: 6px solid #1d70b8; padding: 12px; margin-bottom: 12px; }
          .score-grid, .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .score, .metric { background: #fff; border: 1px solid #b1b4b6; padding: 10px; }
          .metric.pass { border-left: 6px solid #00703c; }
          .metric.warn { border-left: 6px solid #d4351c; }
          .metric strong, .metric span, .metric small { display: block; }
          .token { display: inline-block; min-width: 46px; margin-right: 8px; background: #4c2c92; color: #fff; border-radius: 3px; text-align: center; font-weight: bold; }
          .marker { display: inline-block; min-width: 24px; margin-right: 8px; background: #1d70b8; color: #fff; border-radius: 3px; text-align: center; font-weight: bold; }
          .content { background: #fff; padding: 24px; overflow: auto; }
          .banner { color: #fff; padding: 16px; margin-bottom: 24px; }
          .issue-banner { background: #d4351c; }
          .pass-banner { background: #00703c; }
          .summary-banner { background: #1d70b8; }
          .visual { border: 1px solid #b1b4b6; margin-bottom: 24px; background: #f3f2f1; }
          .visual img { display: block; max-width: 100%; height: auto; }
          .issue, .summary-card { border: 1px solid #b1b4b6; border-left: 8px solid #d4351c; padding: 16px; margin-bottom: 18px; background: #fff; }
          .issue.pass, .summary-card { border-left-color: #00703c; }
          code, pre { background: #f3f2f1; padding: 4px; white-space: pre-wrap; }
          li { margin-bottom: 8px; }
          details { background: #fff; border: 1px solid #b1b4b6; margin-bottom: 12px; padding: 8px; }
          summary { cursor: pointer; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="layout">
          <aside class="panel">
            <h1>${escapeHtml(context.title)}</h1>
            <div class="scorecard">
              <p><strong>${escapeHtml(context.snapshot.title || 'Untitled page')}</strong></p>
              <div class="score-grid">
                <div class="score"><strong>${context.snapshot.headings.length}</strong><br/>Headings</div>
                <div class="score"><strong>${context.snapshot.landmarks.length}</strong><br/>Landmarks</div>
                <div class="score"><strong>${context.snapshot.keyboardOrder.length}</strong><br/>Focus items</div>
                <div class="score"><strong>${context.snapshot.axTree.length}</strong><br/>AX nodes</div>
              </div>
            </div>
            <details open>
              <summary>Headings</summary>
              <ol>${context.snapshot.headings.map((heading) => `<li><span class="token">h${heading.level}</span>${escapeHtml(heading.text || '(empty)')}</li>`).join('') || '<li>No headings detected.</li>'}</ol>
            </details>
            <details open>
              <summary>Landmarks</summary>
              <ol>${context.snapshot.landmarks.map((landmark) => `<li><span class="token">${escapeHtml(landmark.role)}</span>${escapeHtml(landmark.name || '(unlabelled)')} <code>${escapeHtml(landmark.selector)}</code></li>`).join('') || '<li>No landmarks detected.</li>'}</ol>
            </details>
            <details open>
              <summary>Keyboard order</summary>
              <ol>${context.snapshot.keyboardOrder.map((item, index) => `<li><span class="marker">${index + 1}</span><strong>${escapeHtml(item.type)}</strong>: ${escapeHtml(item.name)} <code>${escapeHtml(item.selector)}</code></li>`).join('') || '<li>No focusable controls detected.</li>'}</ol>
            </details>
            <details>
              <summary>Accessibility tree sample</summary>
              <ol>${axTreeItems}</ol>
            </details>
          </aside>
          <main class="content">
            <div class="${context.bannerClass}">
              <h1>${escapeHtml(context.title)}</h1>
              <p>${escapeHtml(context.summary)}</p>
            </div>
            <section class="visual">
              <img alt="Accessibility evidence screenshot" src="${context.screenshotDataUrl}" />
            </section>
            ${context.body}
          </main>
        </div>
      </body>
    </html>
  `;
}

async function runAxeEngine(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<EngineOutcome> {
  const metadata = evidenceMetadata(testInfo, contextLabel);
  const analysis = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .include(A11Y_SCAN_SCOPE)
    .exclude(HIDDEN_TAB_PANEL_SELECTOR)
    .analyze();
  const violations = analysis.violations as A11yViolation[];
  const evidenceName = `${evidencePrefix(testInfo, contextLabel)}-axe`;
  const screenshot = await captureHighlightedIssueScreenshot(page, axeIssueMarkers(violations));
  const screenshotFileName = `${evidenceFileBaseName(testInfo, evidenceName)}-highlighted-screenshot.png`;
  const evidenceFiles = await attachEvidence(
    testInfo,
    evidenceName,
    { ...metadata, url: page.url(), engine: 'axe', violations },
    buildIssuesHtml(`[axe] ${contextLabel}`, page.url(), violations as unknown as Array<Record<string, unknown>>),
    screenshot.length ? [{ fileName: screenshotFileName, body: screenshot }] : []
  );

  return {
    engine: 'axe',
    status: violations.length ? 'issues-found' : 'passed',
    issueCount: violations.length,
    unexpectedIssueCount: violations.length,
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
  const metadata = evidenceMetadata(testInfo, contextLabel);
  const violations = await collectWaveLikeAccessibilityViolations(page);
  const evidenceName = `${evidencePrefix(testInfo, contextLabel)}-wave-like`;
  const screenshot = await captureHighlightedIssueScreenshot(page, waveIssueMarkers(violations));
  const screenshotFileName = `${evidenceFileBaseName(testInfo, evidenceName)}-highlighted-screenshot.png`;
  const evidenceFiles = await attachEvidence(
    testInfo,
    evidenceName,
    { ...metadata, url: page.url(), engine: 'wave-like', violations },
    buildIssuesHtml(`[wave-like] ${contextLabel}`, page.url(), violations as unknown as Array<Record<string, unknown>>),
    screenshot.length ? [{ fileName: screenshotFileName, body: screenshot }] : []
  );

  return {
    engine: 'wave-like',
    status: violations.length ? 'issues-found' : 'passed',
    issueCount: violations.length,
    unexpectedIssueCount: violations.length,
    rules: Array.from(new Set(violations.map((violation) => violation.rule))),
    evidenceFiles
  };
}

async function collectScreenReaderLikeAccessibilityViolations(page: Page): Promise<ScreenReaderLikeViolation[]> {
  return page.evaluate<ScreenReaderLikeViolation[]>(() => {
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
        return `#${id}`;
      }
      const testId = element.getAttribute('data-testid') ?? element.getAttribute('data-test-id');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }
      const tag = element.tagName.toLowerCase();
      const name = element.getAttribute('name');
      return name ? `${tag}[name="${name}"]` : tag;
    };
    const htmlFor = (element: Element): string => element.outerHTML.slice(0, 800);
    const add = (items: ScreenReaderLikeViolation[], rule: string, message: string, element?: Element) => {
      items.push({
        rule,
        message,
        ...(element ? { selector: selectorFor(element), html: htmlFor(element) } : {})
      });
    };
    const referencedText = (element: Element, attribute: string): string =>
      (element.getAttribute(attribute) ?? '')
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
          .map(text)
          .filter(Boolean)
          .join(' ');
      }
      return '';
    };
    const accessibleName = (element: Element): string =>
      [
        element.getAttribute('aria-label')?.trim() ?? '',
        referencedText(element, 'aria-labelledby'),
        controlLabels(element),
        element.getAttribute('title')?.trim() ?? '',
        element.getAttribute('placeholder')?.trim() ?? '',
        element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type) ? element.value.trim() : '',
        Array.from(element.querySelectorAll('img'))
          .map((image) => image.getAttribute('alt')?.trim() ?? '')
          .filter(Boolean)
          .join(' '),
        text(element)
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    const focusableSelector =
      'a[href], button, input, select, textarea, summary, [tabindex], [role="button"], [role="link"], [role="menuitem"]';
    const focusable = (element: Element): boolean => {
      if (!visible(element)) {
        return false;
      }
      if (element.getAttribute('tabindex') === '-1') {
        return false;
      }
      if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        return !element.disabled;
      }
      return element.matches(focusableSelector);
    };

    const violations: ScreenReaderLikeViolation[] = [];

    if (!document.documentElement.lang?.trim()) {
      add(violations, 'sr-document-language', 'Screen readers need the document language on the html element.');
    }
    if (!document.title.trim() || /^untitled$/i.test(document.title.trim())) {
      add(violations, 'sr-document-title', 'Screen readers need a meaningful document title.');
    }

    const skipLink = Array.from(document.querySelectorAll('a[href^="#"]'))
      .filter(visible)
      .find((link) => /skip to main content/i.test(text(link)));
    if (!skipLink) {
      add(violations, 'skip-link', 'The page should expose a visible skip-to-main-content link.');
    } else {
      const targetId = skipLink.getAttribute('href')?.slice(1) ?? '';
      if (!targetId || !document.getElementById(decodeURIComponent(targetId))) {
        add(violations, 'skip-link-target', `Skip link target "#${targetId}" should exist.`, skipLink);
      }
    }

    const mainLandmarks = Array.from(document.querySelectorAll('main, [role="main"]')).filter(visible);
    if (mainLandmarks.length !== 1) {
      add(violations, 'main-landmark', `Expected exactly one visible main landmark, found ${mainLandmarks.length}.`);
    }

    Array.from(document.querySelectorAll(focusableSelector))
      .filter(focusable)
      .filter((element) => !accessibleName(element))
      .forEach((element) => add(violations, 'sr-accessible-name', 'Focusable controls need an accessible name.', element));

    Array.from(document.querySelectorAll('[tabindex]'))
      .filter(visible)
      .filter((element) => Number(element.getAttribute('tabindex')) > 0)
      .forEach((element) =>
        add(violations, 'positive-tabindex', 'Positive tabindex creates a non-natural keyboard order.', element)
      );

    Array.from(document.querySelectorAll('[aria-hidden="true"]'))
      .filter((element) => Array.from(element.querySelectorAll(focusableSelector)).some(focusable))
      .forEach((element) =>
        add(violations, 'aria-hidden-focusable', 'aria-hidden containers must not contain focusable controls.', element)
      );

    Array.from(document.querySelectorAll('[aria-labelledby], [aria-describedby]')).forEach((element) => {
      for (const attribute of ['aria-labelledby', 'aria-describedby']) {
        const ids = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
        const missing = ids.filter((id) => !document.getElementById(id));
        if (missing.length > 0) {
          add(violations, 'aria-reference-target', `${attribute} references missing id(s): ${missing.join(', ')}.`, element);
        }
      }
    });

    Array.from(document.querySelectorAll('.govuk-error-summary'))
      .filter(visible)
      .forEach((summary) => {
        if (!document.title.startsWith('Error:')) {
          add(
            violations,
            'error-title-prefix',
            'Pages with an error summary should prefix the document title with "Error:".',
            summary
          );
        }
        Array.from(summary.querySelectorAll('a[href^="#"]')).forEach((link) => {
          const targetId = decodeURIComponent((link.getAttribute('href') ?? '').slice(1));
          if (!targetId || !document.getElementById(targetId)) {
            add(violations, 'error-summary-target', `Error summary link target "#${targetId}" should exist.`, link);
          }
        });
      });

    Array.from(document.querySelectorAll('table'))
      .filter(visible)
      .filter((table) => table.querySelectorAll('td').length > 0)
      .filter((table) => table.querySelectorAll('th, [role="columnheader"], [role="rowheader"]').length === 0)
      .forEach((table) =>
        add(violations, 'table-headers', 'Screen-reader users need row or column headers in data tables.', table)
      );

    return violations;
  });
}

function buildScreenReaderEvidenceHtml(evidence: ScreenReaderLikeEvidence, screenshot: Buffer): string {
  const screenshotDataUrl = `data:image/png;base64,${(screenshot.length ? screenshot : TRANSPARENT_PIXEL).toString('base64')}`;
  const issueCards = evidence.violations
    .map(
      (violation, index) => `
        <section class="issue">
          <h2>${index + 1}. ${escapeHtml(violation.rule)}</h2>
          <p><strong>${escapeHtml(violation.message)}</strong></p>
          <p><strong>Selector:</strong> <code>${escapeHtml(violation.selector ?? 'page')}</code></p>
          <pre>${escapeHtml(violation.html ?? '')}</pre>
        </section>
      `
    )
    .join('');

  return buildEvidenceShell({
    title: 'Screen-reader-like accessibility evidence',
    bannerClass: evidence.violations.length > 0 ? 'banner issue-banner' : 'banner pass-banner',
    summary: `${evidence.violations.length} screen-reader-like issue(s) on ${evidence.url}`,
    snapshot: evidence.snapshot,
    screenshotDataUrl,
    body:
      issueCards ||
      '<section class="issue pass"><h2>No screen-reader-like issues found</h2><p>Keyboard order, naming, landmarks, template structure, and announcement contracts passed this heuristic lane.</p></section>'
  });
}

async function runScreenReaderLikeEngine(page: Page, contextLabel: string, testInfo?: TestInfo): Promise<EngineOutcome> {
  const metadata = evidenceMetadata(testInfo, contextLabel);
  const violations = await collectScreenReaderLikeAccessibilityViolations(page);
  const snapshot = await collectPageSnapshot(page);
  const evidence: ScreenReaderLikeEvidence = {
    ...metadata,
    url: page.url(),
    engine: 'screen-reader',
    violations,
    snapshot
  };
  const evidenceName = `${evidencePrefix(testInfo, contextLabel)}-screen-reader`;
  const screenshot = await captureHighlightedIssueScreenshot(page, waveIssueMarkers(violations));
  const screenshotFileName = `${evidenceFileBaseName(testInfo, evidenceName)}-screenshot.png`;
  const evidenceFiles = await attachEvidence(
    testInfo,
    evidenceName,
    evidence,
    buildScreenReaderEvidenceHtml(evidence, screenshot),
    screenshot.length ? [{ fileName: screenshotFileName, body: screenshot }] : []
  );

  return {
    engine: 'screen-reader',
    status: violations.length ? 'issues-found' : 'passed',
    issueCount: violations.length,
    unexpectedIssueCount: violations.length,
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
  const metadata = evidenceMetadata(testInfo, contextLabel);
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
        ...metadata,
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
      unexpectedIssueCount: 0,
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
        ...metadata,
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
      unexpectedIssueCount: 1,
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
  page: Page,
  testInfo: TestInfo | undefined,
  contextLabel: string,
  url: string,
  outcomes: EngineOutcome[]
): Promise<void> {
  const strict = isStrictMode();
  const { feature, pageState } = evidenceMetadata(testInfo, contextLabel);
  const unexpectedCount = outcomes.reduce((count, outcome) => count + (outcome.unexpectedIssueCount ?? outcome.issueCount), 0);
  const issueFindings = outcomes
    .filter((outcome) => outcome.status !== 'passed' && (outcome.unexpectedIssueCount ?? outcome.issueCount) > 0)
    .map(
      (outcome) =>
        `${outcome.engine}: ${outcome.unexpectedIssueCount ?? outcome.issueCount} unexpected (${outcome.rules.join(', ') || 'no rule recorded'})`
    );
  const body = {
    feature,
    pageState,
    url,
    strict,
    outcomes,
    snapshot: await collectPageSnapshot(page),
    summary: `${outcomes.length} engine(s), ${unexpectedCount} unexpected issue(s)`
  };
  const screenshot = await capturePageSummaryScreenshot(page, issueFindings);
  const attachmentPrefix = `${sanitiseFileName(feature)}-${sanitiseFileName(pageState)}-page-summary`;
  const screenshotFileName = `${evidenceFileBaseName(testInfo, attachmentPrefix)}-screenshot.png`;

  await attachEvidence(
    testInfo,
    attachmentPrefix,
    body,
    buildPageSummaryHtml(body, screenshot),
    screenshot.length ? [{ fileName: screenshotFileName, body: screenshot }] : []
  );
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

  if (engines.includes('screen-reader')) {
    outcomes.push(await runScreenReaderLikeEngine(page, contextLabel, testInfo));
  }

  if (engines.includes('lighthouse')) {
    outcomes.push(await runLighthouseEngine(page, contextLabel, testInfo));
  }

  await attachAuditSummary(page, testInfo, contextLabel, page.url(), outcomes);

  const issues = outcomes.filter((outcome) => outcome.status !== 'passed' && (outcome.unexpectedIssueCount ?? outcome.issueCount) > 0);
  const strictMode = isStrictMode();
  const issueMessage = formatAccessibilityIssueMessage(contextLabel, strictMode, issues);

  if (issues.length > 0) {
    testInfo?.annotations.push({
      type: 'accessibility',
      description: `${contextLabel}: ${issues.length} accessibility engine(s) reported issues. See attached evidence.`
    });
  }

  expect(
    issues.length,
    issueMessage
  ).toBe(0);
}

function formatAccessibilityIssueMessage(contextLabel: string, strictMode: boolean, issues: EngineOutcome[]): string {
  const issueSummaries = issues.map((issue) => {
    const issueCount = issue.unexpectedIssueCount ?? issue.issueCount;
    const rules = issue.rules.length ? `; rules: ${issue.rules.slice(0, 5).join(', ')}` : '';
    const evidence = issue.evidenceFiles?.length ? `; evidence files: ${issue.evidenceFiles.slice(0, 3).join(', ')}` : '';
    const extraRules = issue.rules.length > 5 ? `, +${issue.rules.length - 5} more` : '';
    const extraEvidence = issue.evidenceFiles && issue.evidenceFiles.length > 3 ? `, +${issue.evidenceFiles.length - 3} more` : '';

    return `- ${issue.engine}: ${issue.status}; ${issueCount} issue(s)${rules}${extraRules}${evidence}${extraEvidence}`;
  });

  return [
    `Accessibility issues found for "${contextLabel}".`,
    strictMode
      ? 'A11Y_STRICT is enabled, so this Playwright run is blocking.'
      : 'A11Y_STRICT is disabled, so the accessibility wrapper keeps Jenkins non-blocking.',
    ...issueSummaries,
    'Open the accessibility evidence links in the report for the full results, highlighted HTML, and screenshots.'
  ].join('\n');
}

export const __test__ = {
  attachAuditSummary,
  evidenceFileBaseName,
  formatAccessibilityIssueMessage,
  sanitiseFileName
};

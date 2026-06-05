import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const A11Y_SCAN_SCOPE = 'main#content, main#main-content, #content, main';
const HIDDEN_TAB_PANEL_SELECTOR = '.govuk-tabs__panel--hidden';

type A11yViolation = {
  id: string;
  impact?: string | null;
  description: string;
  nodes: Array<{ target: string[] }>;
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

export async function accessibilityCheck(page: Page, contextLabel: string): Promise<void> {
  await expect(page.locator('main, #main-content, #content').first()).toBeVisible({ timeout: 30_000 });

  const analysis = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .include(A11Y_SCAN_SCOPE)
    .exclude(HIDDEN_TAB_PANEL_SELECTOR)
    .analyze();
  const violations = analysis.violations as A11yViolation[];

  expect(
    violations,
    `[a11y] ${contextLabel}\n${formatViolations(violations)}`
  ).toEqual([]);
}

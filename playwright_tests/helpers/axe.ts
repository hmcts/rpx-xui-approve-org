import { AxeUtils } from '@hmcts/playwright-common';
import type { Page, TestInfo } from '@playwright/test';

type AxeOptions = {
  include?: string | string[];
  exclude?: string | string[];
  disableRules?: string | string[];
  reportName?: string;
};

export async function runAxeAudit(page: Page, testInfo: TestInfo, options: AxeOptions = {}): Promise<void> {
  if (process.env.ENABLE_AXE_TESTS !== 'true') {
    return;
  }

  const axe = new AxeUtils(page);
  await axe.audit({
    include: options.include,
    exclude: options.exclude,
    disableRules: options.disableRules
  });
  await axe.generateReport(testInfo, options.reportName);
}

import { test, expect } from './e2e/page-objects/page.fixtures';
import { runAxeAudit } from './helpers/axe';
import { ensureAuthenticatedPage } from './helpers/sessionCapture';

test.beforeEach(async ({ page }) => {
  await ensureAuthenticatedPage(page, 'base');
});
test('all tabs on login load data', async ({ page, organisationApprovalsPage }, testInfo) => {
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
  await runAxeAudit(page, testInfo, { reportName: 'Pending organisations tab' });
  await organisationApprovalsPage.openNewPbasTab();
  await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
  await runAxeAudit(page, testInfo, { reportName: 'New PBAs tab' });
  await organisationApprovalsPage.openActiveOrganisationsTab();
  await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
  await runAxeAudit(page, testInfo, { reportName: 'Active organisations tab' });
});

import { test, expect } from './e2e/page-objects/page.fixtures';
import { ensureAuthenticatedPage } from './helpers/sessionCapture';

test.beforeEach(async ({ page }) => {
  await ensureAuthenticatedPage(page, 'base');
});
test('all tabs on login load data', async ({ organisationApprovalsPage }) => {
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
  await organisationApprovalsPage.openNewPbasTab();
  await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
  await organisationApprovalsPage.openActiveOrganisationsTab();
  await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
});

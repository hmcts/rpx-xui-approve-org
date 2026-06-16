import { expect, type Page } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
import { OrganisationApprovalsPage } from '../../page-objects/pages';

export async function assertOrganisationApprovalsUi(page: Page): Promise<OrganisationApprovalsPage> {
  await ensureAuthenticatedPage(page, 'base');
  const organisationApprovalsPage = new OrganisationApprovalsPage(page);
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
  await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
  await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();

  return organisationApprovalsPage;
}

export async function assertActiveOrganisationsPanelVisible(
  organisationApprovalsPage: OrganisationApprovalsPage
): Promise<void> {
  await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
}

import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { setupCommonOrganisationApiMocks } from './mocks';

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page, organisationApprovalsPage }) => {
    const { pendingOrganisations, activeOrganisations } = await setupCommonOrganisationApiMocks(page);

    await test.step('Open approvals page and verify pending organisations', async () => {
      await ensureAuthenticatedPage(page, 'base');
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisations[0].name)).toBeVisible();
    });

    await test.step('Open active organisations tab and verify active organisations', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisations[0].name)).toBeVisible();
    });
  });
});

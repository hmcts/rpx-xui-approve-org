import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import { openOrganisationApprovalsPage } from './helpers/organisation-approvals.helpers';
import {
  ACTIVE_ORGANISATIONS_TABLE_SELECTOR,
  PENDING_ORGANISATIONS_TABLE_SELECTOR,
  setupCommonOrganisationApiMocks,
  waitForOrganisationNameInTable,
  waitForOrganisationStatusResponse
} from './mocks';

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page }) => {
    const { pendingOrganisations, activeOrganisations } = await setupCommonOrganisationApiMocks(page);
    const pendingResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');

    const organisationApprovalsPage = await openOrganisationApprovalsPage(page);
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await expect(organisationApprovalsPage.tabPanel).toBeVisible();
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
    await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
    await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
    await pendingResponse;
    await waitForOrganisationNameInTable(page, PENDING_ORGANISATIONS_TABLE_SELECTOR, pendingOrganisations[0].name);

    const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeResponse;
    await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    await waitForOrganisationNameInTable(page, ACTIVE_ORGANISATIONS_TABLE_SELECTOR, activeOrganisations[0].name);
  });
});

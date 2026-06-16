import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import { openOrganisationApprovalsPage } from './helpers/organisation-approvals.helpers';
import {
  setupCommonOrganisationApiMocks,
  waitForOrganisationStatusResponse
} from './mocks';

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page }) => {
    const { pendingOrganisations, activeOrganisations } = await test.step('Setup mocked organisation APIs', async () =>
      setupCommonOrganisationApiMocks(page)
    );

    const organisationApprovalsPage = await test.step('Open approvals page and verify pending organisations', async () => {
      const pendingResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      const approvalsPage = await openOrganisationApprovalsPage(page);
      await expect(approvalsPage.heading).toBeVisible();
      await expect(approvalsPage.tabPanel).toBeVisible();
      await expect(approvalsPage.pendingOverviewPanel).toBeVisible();
      await expect(approvalsPage.newPbasTab).toBeVisible();
      await expect(approvalsPage.activeOrganisationsTab).toBeVisible();
      await pendingResponse;
      await expect(approvalsPage.pendingOrganisationRowByName(pendingOrganisations[0].name)).toBeVisible();
      return approvalsPage;
    });

    await test.step('Open active organisations tab and verify active organisations', async () => {
      const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await activeResponse;
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisations[0].name)).toBeVisible();
    });
  });
});

import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import {
  activeListUrlPattern,
  pendingListUrlPattern,
  setupNavigationLinksIntegrationPage
} from './helpers/navigation-links.helpers';

test.describe('Playwright integration: organisation backlink navigation', {
  tag: ['@integration', '@organisations', '@navigation-links']
}, () => {
  test('Pending org details back link returns to pending list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await test.step('Setup mocked navigation data', async () => setupNavigationLinksIntegrationPage(page));

    await test.step('Open pending organisation details', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisationName)).toBeVisible();
      await organisationApprovalsPage.openFirstPendingOrganisation();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });

    await test.step('Use back link to return to pending list', async () => {
      await organisationApprovalsPage.clickBackLink();
      await expect(page).toHaveURL(pendingListUrlPattern);
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisationName)).toBeVisible();
    });
  });

  test('Active org details back link returns to active list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await test.step('Setup mocked navigation data', async () => setupNavigationLinksIntegrationPage(page));

    await test.step('Open active organisation details', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });

    await test.step('Use back link to return to active list', async () => {
      await organisationApprovalsPage.clickBackLink();
      await expect(page).toHaveURL(activeListUrlPattern);
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
    });
  });

  test('Confirm decision back link returns to pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await test.step('Setup mocked navigation data', async () => setupNavigationLinksIntegrationPage(page));

    await test.step('Open pending organisation details', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisationName)).toBeVisible();
      await organisationApprovalsPage.openFirstPendingOrganisation();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });

    await test.step('Open confirm decision page', async () => {
      await organisationApprovalsPage.chooseDecision('Approve it');
      await organisationApprovalsPage.submitDecision();

      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await expect(page).toHaveURL(/\/approve-organisations(?:\/?|\?.*)$/);
    });

    await test.step('Use back link to return to pending details', async () => {
      await organisationApprovalsPage.clickBackLink();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });
  });

  test('Delete confirm page back link returns to active details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await test.step('Setup mocked navigation data', async () => setupNavigationLinksIntegrationPage(page));

    await test.step('Open active organisation details', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(organisationApprovalsPage.deleteOrganisationDetailsButton).toBeVisible();
    });

    await test.step('Open delete confirmation page', async () => {
      await organisationApprovalsPage.deleteActiveOrganisation();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await expect(page).toHaveURL(/\/delete-organisation(?:\/?|\?.*)$/);
    });

    await test.step('Use back link to return to active details', async () => {
      await organisationApprovalsPage.clickBackLink();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });
  });

  test('Active users tab back link returns to active list, then pending list, then pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName,
      activeOrganisationName
    } = await test.step('Setup mocked navigation data', async () => setupNavigationLinksIntegrationPage(page));

    await test.step('Open active organisation users tab', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();

      await organisationApprovalsPage.openUsersTab();
      await expect(organisationApprovalsPage.usersList).toBeVisible();
    });

    await test.step('Use back link to return to active list', async () => {
      await organisationApprovalsPage.clickBackLink();
      await expect(page).toHaveURL(activeListUrlPattern);
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeOrganisationName)).toBeVisible();
    });

    await test.step('Open pending list from active list', async () => {
      await organisationApprovalsPage.openPendingOrganisationsTab();
      await expect(page).toHaveURL(pendingListUrlPattern);
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisationName)).toBeVisible();
    });

    await test.step('Open pending organisation details', async () => {
      await organisationApprovalsPage.openFirstPendingOrganisation();
      await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
    });
  });
});

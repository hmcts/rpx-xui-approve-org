import { test, expect } from './helpers/integration.fixtures';
import {
  clickBackLink,
  setupNavigationLinksIntegrationPage
} from './helpers/navigation-links.helpers';

const pendingListUrlPattern = /\/organisation\/pending(?:\/?|\?.*)$/;
const activeListUrlPattern = /\/organisation\/active(?:\/?|\?.*)$/;

test.describe('Playwright integration: organisation backlink navigation', {
  tag: ['@integration', '@organisations', '@navigation-links']
}, () => {
  test('Pending org details back link returns to pending list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();
    await organisationApprovalsPage.openFirstPendingOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

    await Promise.all([
      page.waitForURL(pendingListUrlPattern),
      clickBackLink(page)
    ]);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();
  });

  test('Active org details back link returns to active list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
    await organisationApprovalsPage.openFirstActiveOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

    await Promise.all([
      page.waitForURL(activeListUrlPattern),
      clickBackLink(page)
    ]);

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
  });

  test('Confirm decision back link returns to pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();
    await organisationApprovalsPage.openFirstPendingOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));

    await organisationApprovalsPage.chooseDecision('Approve it');
    await organisationApprovalsPage.submitDecision();

    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
    await expect(page).toHaveURL(/\/approve-organisations(?:\/?|\?.*)$/);

    await Promise.all([
      page.waitForURL(new RegExp(`/organisation-details/${pendingOrganisationId}`)),
      clickBackLink(page)
    ]);

    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
  });

  test('Delete confirm page back link returns to active details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
    await organisationApprovalsPage.openFirstActiveOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
    await expect(organisationApprovalsPage.deleteOrganisationDetailsButton).toBeVisible();

    await organisationApprovalsPage.deleteActiveOrganisation();
    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
    await expect(page).toHaveURL(/\/delete-organisation(?:\/?|\?.*)$/);

    await Promise.all([
      page.waitForURL(new RegExp(`/organisation-details/${activeOrganisationId}`)),
      clickBackLink(page)
    ]);

    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
  });

  test('Active users tab back link returns to active list, then pending list, then pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
    await organisationApprovalsPage.openFirstActiveOrganisation();

    await organisationApprovalsPage.openUsersTab();
    await expect(organisationApprovalsPage.usersList).toBeVisible();

    await Promise.all([
      page.waitForURL(activeListUrlPattern),
      clickBackLink(page)
    ]);

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();

    await organisationApprovalsPage.openPendingOrganisationsTab();
    await expect(page).toHaveURL(pendingListUrlPattern);
    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();

    await organisationApprovalsPage.openFirstPendingOrganisation();
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
  });
});

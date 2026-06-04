import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { accessibilityCheck } from '../helpers/accessibility';

test.describe('Accessibility: organisation tab states and user upload', { tag: ['@accessibility'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test(
    'Pending organisations tab passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await accessibilityCheck(page, 'Pending organisations tab');
    }
  );

  test(
    'Viewing a new registration organisation from pending list passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openPendingOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

      const hasPendingRegistration = await organisationApprovalsPage
        .pendingOrganisationViewLink()
        .isVisible()
        .catch(() => false);
      test.skip(!hasPendingRegistration, 'No pending registration requests are available for the current data set.');

      await organisationApprovalsPage.openFirstPendingOrganisation();
      await expect(page).toHaveURL(/\/organisation-details\/[^/?#]+(?:\/?|\?.*)$/);
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await accessibilityCheck(page, 'Pending registration details view');
    }
  );

  test(
    'New pbas tab passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
      await accessibilityCheck(page, 'New PBAs tab');
    }
  );

  test(
    'Viewing a PBA from the new PBAs list passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openNewPbasTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();

      await organisationApprovalsPage
        .pendingPbaViewLink()
        .isVisible()
        .catch(() => false);

      await organisationApprovalsPage.openFirstPendingPba();
      await expect(page).toHaveURL(/\/(?:organisation\/)?pbas\/new\/[^/?#]+(?:\/?|\?.*)$/);
      await expect(organisationApprovalsPage.newPbaDetailsPageHeading).toBeVisible();
      await expect(organisationApprovalsPage.newPbaAccountsHeading).toBeVisible();
      await accessibilityCheck(page, 'Pending PBA details view');
    }
  );

  test(
    'Active organisations tab passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      await accessibilityCheck(page, 'Active organisations tab');
    }
  );

  test(
    'Viewing an organisation from active tab passes baseline accessibility scan',
    { tag: ['@tabs-states'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await accessibilityCheck(page, 'Active organisation details view');
    }
  );

  test(
    'Staff details header tab page passes baseline accessibility scan',
    { tag: ['@staff-details'] },
    async ({ organisationApprovalsPage, page }) => {
      await expect(organisationApprovalsPage.heading).toBeVisible();

      await expect(organisationApprovalsPage.staffDetailsHeaderTab()).toBeVisible();
      await organisationApprovalsPage.openStaffDetailsTab();

      await expect(page).toHaveURL(/\/caseworker-details(?:\/?|\?.*)$/);
      await expect(organisationApprovalsPage.staffDetailsPageHeading).toHaveText(/Upload staff details/i);
      await accessibilityCheck(page, 'Staff details page');
    }
  );

  test(
    'Org user list passes baseline accessibility scan',
    { tag: ['@user-upload'] },
    async ({ organisationApprovalsPage, page }) => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

      await organisationApprovalsPage.openUsersTab();
      await expect(organisationApprovalsPage.usersList).toBeVisible();

      await expect(organisationApprovalsPage.userUploadSurface()).toBeVisible();

      await accessibilityCheck(page, 'User upload surface');
    }
  );
});

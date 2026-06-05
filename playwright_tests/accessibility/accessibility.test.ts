import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { accessibilityCheck } from '../helpers/accessibility';

test.describe('Accessibility: organisation tab states and user upload', { tag: ['@accessibility'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base', { partitionKey: 'a11y' });
  });

  test.describe('Pending organisations', () => {
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

        await organisationApprovalsPage.openFirstPendingOrganisation();
        await expect(page).toHaveURL(/\/organisation-details\/[^/?#]+(?:\/?|\?.*)$/);
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
        await accessibilityCheck(page, 'Pending registration details view');
      }
    );

    test(
      'Approving a new registration organisation opens confirmation page and passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }) => {
        await organisationApprovalsPage.openPendingOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

        await organisationApprovalsPage.openFirstPendingOrganisation();
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
        await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();

        await organisationApprovalsPage.chooseDecision('Approve it');
        await organisationApprovalsPage.submitDecision();

        await expect(organisationApprovalsPage.confirmDecisionHeading).toHaveText(/Confirm your decision/i);
        await expect(organisationApprovalsPage.confirmButton).toBeVisible();
        await accessibilityCheck(page, 'Pending registration approval confirmation');
      }
    );
  });

  test.describe('New PBAs', () => {
    test(
      'New pbas list tab passes baseline accessibility scan',
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

        await organisationApprovalsPage.openFirstPendingPba();
        await expect(page).toHaveURL(/\/(?:organisation\/)?pbas\/new\/[^/?#]+(?:\/?|\?.*)$/);
        await expect(organisationApprovalsPage.newPbaDetailsPageHeading).toBeVisible();
        await expect(organisationApprovalsPage.newPbaAccountsHeading).toBeVisible();
        await accessibilityCheck(page, 'Pending PBA details view');
      }
    );

    test(
      'Approving a new PBA opens confirmation page and passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }) => {
        await organisationApprovalsPage.openNewPbasTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();

        await organisationApprovalsPage.openFirstPendingPba();
        await expect(organisationApprovalsPage.newPbaDetailsPageHeading).toBeVisible();

        await organisationApprovalsPage.approveAllPendingPbas();
        await expect(organisationApprovalsPage.pendingPbaContinueButton).toBeEnabled();
        await organisationApprovalsPage.continuePendingPbaDecision();

        await expect(organisationApprovalsPage.confirmDecisionHeading).toHaveText(/Confirm your decision/i);
        await expect(organisationApprovalsPage.confirmButton).toBeVisible();
        await accessibilityCheck(page, 'Pending PBA approval confirmation');
      }
    );
  });

  test.describe('Active organisations', () => {
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
      'Active organisation user list passes baseline accessibility scan',
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

  test.describe('Staff details', () => {
    test(
      'Upload staff details page passes baseline accessibility scan',
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
  });
});

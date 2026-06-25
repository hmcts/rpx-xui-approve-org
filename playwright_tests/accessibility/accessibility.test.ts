import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { accessibilityCheck } from '../helpers/accessibility';
import { clearOrganisationSearchSession } from '../integration/helpers/organisation-search.helpers';
import {
  setupPbaStatusUpdateApiMock,
  setupPendingOrganisationDecisionApiMock,
  setupStandardOrganisationApprovalsApiMocks
} from '../integration/mocks';
import {
  ACCESSIBILITY_APPROVALS_MOCK_STATE,
  ACCESSIBILITY_PENDING_ORGANISATION_ID,
  ACCESSIBILITY_VISIBLE_PAGE_ROWS
} from './test-data/accessibility-approvals.mock-data';

test.describe('Accessibility: organisation tab states and user upload', { tag: ['@accessibility', '@wave-a11y', '@lighthouse-a11y'] }, () => {
  test.beforeEach(async ({ page }) => {
    await clearOrganisationSearchSession(page);
    await setupStandardOrganisationApprovalsApiMocks(page, ACCESSIBILITY_APPROVALS_MOCK_STATE);
    await setupPendingOrganisationDecisionApiMock(page, {
      organisationId: ACCESSIBILITY_PENDING_ORGANISATION_ID
    });
    await setupPbaStatusUpdateApiMock(page);
    await ensureAuthenticatedPage(page, 'base');
  });

  test.describe('Pending organisations', () => {
    test(
      'Pending organisations tab passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await expect(organisationApprovalsPage.heading).toBeVisible();
        await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
        await expect(organisationApprovalsPage.pendingOrganisationDataRows).toHaveCount(ACCESSIBILITY_VISIBLE_PAGE_ROWS);
        await expect(organisationApprovalsPage.pagination).toBeVisible();
        await accessibilityCheck(page, 'Pending organisations tab', testInfo);
      }
    );

    test(
      'Viewing a new registration organisation from pending list passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openPendingOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

        await organisationApprovalsPage.openFirstPendingOrganisation();
        await expect(page).toHaveURL(/\/organisation-details\/[^/?#]+(?:\/?|\?.*)$/);
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
        await accessibilityCheck(page, 'Pending registration details view', testInfo);
      }
    );

    test(
      'Approving a new registration organisation opens confirmation page and passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
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
        await accessibilityCheck(page, 'Pending registration approval confirmation', testInfo);
      }
    );
  });

  test.describe('New PBAs', () => {
    test(
      'New pbas list tab passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openNewPbasTab();
        await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
        await expect(organisationApprovalsPage.pendingPbaRows).toHaveCount(ACCESSIBILITY_VISIBLE_PAGE_ROWS);
        await expect(organisationApprovalsPage.pagination).toBeVisible();
        await accessibilityCheck(page, 'New PBAs tab', testInfo);
      }
    );

    test(
      'Viewing a PBA from the new PBAs list passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openNewPbasTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();

        await organisationApprovalsPage.openFirstPendingPba();
        await expect(page).toHaveURL(/\/(?:organisation\/)?pbas\/new\/[^/?#]+(?:\/?|\?.*)$/);
        await expect(organisationApprovalsPage.newPbaDetailsPageHeading).toBeVisible();
        await expect(organisationApprovalsPage.newPbaAccountsHeading).toBeVisible();
        await accessibilityCheck(page, 'Pending PBA details view', testInfo);
      }
    );

    test(
      'Approving a new PBA opens confirmation page and passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
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
        await accessibilityCheck(page, 'Pending PBA approval confirmation', testInfo);
      }
    );
  });

  test.describe('Active organisations', () => {
    test(
      'Active organisations tab passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
        await expect(organisationApprovalsPage.activeOrganisationDataRows).toHaveCount(ACCESSIBILITY_VISIBLE_PAGE_ROWS);
        await expect(organisationApprovalsPage.pagination).toBeVisible();
        await accessibilityCheck(page, 'Active organisations tab', testInfo);
      }
    );

    test(
      'Viewing an organisation from active tab passes baseline accessibility scan',
      { tag: ['@tabs-states'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
        await organisationApprovalsPage.openFirstActiveOrganisation();
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
        await accessibilityCheck(page, 'Active organisation details view', testInfo);
      }
    );

    test(
      'Active organisation user list passes baseline accessibility scan',
      { tag: ['@staff-details'] },
      async ({ organisationApprovalsPage, page }, testInfo) => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
        await organisationApprovalsPage.openFirstActiveOrganisation();
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

        await organisationApprovalsPage.openUsersTab();
        await expect(organisationApprovalsPage.usersList).toBeVisible();

        await accessibilityCheck(page, 'User upload surface', testInfo);
      }
    );
  });
});

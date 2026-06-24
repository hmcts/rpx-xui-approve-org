import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { accessibilityCheck } from '../helpers/accessibility';
import { clearOrganisationSearchSession } from '../integration/helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  createMockOrganisationUser,
  createMockPendingPbaOrganisation,
  setupPbaStatusUpdateApiMock,
  setupPendingOrganisationDecisionApiMock,
  setupStandardOrganisationApprovalsApiMocks
} from '../integration/mocks';

const ACCESSIBILITY_PENDING_ORGANISATION = createMockOrganisation({
  organisationIdentifier: 'A11YPENDING01',
  name: 'Accessibility Pending Org',
  status: 'PENDING',
  paymentAccount: [],
  pendingPaymentAccount: ['PBA4100001'],
  dateReceived: '2024-06-01T00:00:00.000Z'
});

const ACCESSIBILITY_ACTIVE_ORGANISATION = createMockOrganisation({
  organisationIdentifier: 'A11YACTIVE01',
  name: 'Accessibility Active Org',
  status: 'ACTIVE',
  paymentAccount: ['PBA4200001'],
  pendingPaymentAccount: [],
  dateApproved: '2024-06-02T00:00:00.000Z'
});

const ACCESSIBILITY_PENDING_PBA_ORGANISATION = createMockPendingPbaOrganisation({
  organisationIdentifier: 'A11YPBA01',
  organisationName: 'Accessibility PBA Org',
  pbaNumbers: [{ pbaNumber: 'PBA4300001', dateCreated: new Date('2024-06-03T00:00:00.000Z').toISOString() }]
});

const ACCESSIBILITY_PENDING_PBA_DETAILS = createMockOrganisation({
  organisationIdentifier: ACCESSIBILITY_PENDING_PBA_ORGANISATION.organisationIdentifier,
  name: ACCESSIBILITY_PENDING_PBA_ORGANISATION.organisationName,
  status: 'ACTIVE',
  paymentAccount: [],
  pendingPaymentAccount: ACCESSIBILITY_PENDING_PBA_ORGANISATION.pbaNumbers.map(({ pbaNumber }) => pbaNumber)
});

test.describe('Accessibility: organisation tab states and user upload', { tag: ['@accessibility'] }, () => {
  test.beforeEach(async ({ page }) => {
    await clearOrganisationSearchSession(page);
    await setupStandardOrganisationApprovalsApiMocks(page, {
      organisations: {
        pendingOrganisations: [ACCESSIBILITY_PENDING_ORGANISATION],
        activeOrganisations: [ACCESSIBILITY_ACTIVE_ORGANISATION],
        singleOrganisationsById: {
          [ACCESSIBILITY_PENDING_ORGANISATION.organisationIdentifier]: ACCESSIBILITY_PENDING_ORGANISATION,
          [ACCESSIBILITY_ACTIVE_ORGANISATION.organisationIdentifier]: ACCESSIBILITY_ACTIVE_ORGANISATION,
          [ACCESSIBILITY_PENDING_PBA_DETAILS.organisationIdentifier]: ACCESSIBILITY_PENDING_PBA_DETAILS
        }
      },
      pendingPbaOrganisations: [ACCESSIBILITY_PENDING_PBA_ORGANISATION],
      organisationUsers: [
        createMockOrganisationUser({
          firstName: 'Accessibility',
          lastName: 'User',
          email: 'accessibility.user@example.com'
        })
      ]
    });
    await setupPendingOrganisationDecisionApiMock(page, {
      organisationId: ACCESSIBILITY_PENDING_ORGANISATION.organisationIdentifier
    });
    await setupPbaStatusUpdateApiMock(page);
    await ensureAuthenticatedPage(page, 'base');
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
      { tag: ['@staff-details'] },
      async ({ organisationApprovalsPage, page }) => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await organisationApprovalsPage.waitForSpinnerToHide(60_000);
        await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
        await organisationApprovalsPage.openFirstActiveOrganisation();
        await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

        await organisationApprovalsPage.openUsersTab();
        await expect(organisationApprovalsPage.usersList).toBeVisible();

        await accessibilityCheck(page, 'User upload surface');
      }
    );
  });
});

import { test, expect } from '../helpers/fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

test.describe('Organisation approvals - pending org workflows', { tag: ['@e2e', '@organisations', '@org-workflows'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test('I can reject a pending org', async ({ organisationApprovalsPage, userName, organisationIdentifier }) => {
    await test.step('Search for and open the pending organisation', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.searchForOrganisation(userName);
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
      await organisationApprovalsPage.openPendingOrganisationById(organisationIdentifier);
    });

    await test.step('Reject the pending organisation', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await organisationApprovalsPage.chooseDecision('Reject it');
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide();
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration rejected/i)).toBeVisible();
    });
  });

  test('I can place registration under review for a pending org', async ({
    organisationApprovalsPage,
    userName,
    organisationIdentifier
  }) => {
    let organisationName = '';

    await test.step('Search for and open the pending organisation', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.searchForOrganisation(userName);
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
      await organisationApprovalsPage.openPendingOrganisationById(organisationIdentifier);
    });

    await test.step('Place the registration under review', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      organisationName = await organisationApprovalsPage.getOrganisationNameFromDetails();
      await organisationApprovalsPage.chooseDecision(/Place registration under review/i);
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide();
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration put under/i)).toBeVisible();
    });

    await test.step('Search by company name and confirm it appears in pending results', async () => {
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowsByName(organisationName).first()).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
    });
  });

  test('I can approve a pending organisation', async ({ organisationApprovalsPage, userName, organisationIdentifier }) => {
    await test.step('Pending organisation appears in active organisations tab', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.searchForOrganisation(userName);
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
      await organisationApprovalsPage.openPendingOrganisationById(organisationIdentifier);
    });

    await test.step('Approve a pending organisation so it appears in active organisations', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await organisationApprovalsPage.chooseDecision('Approve it');
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration approved/i)).toBeVisible();
    });
  });

  // Skipping until EXUI-4610 and assoicated bug tickets have been resolved.
  test.skip('i can delete an active org', async ({ organisationApprovalsPage, userName, organisationIdentifier }) => {
    let organisationName = '';

    await test.step('Approve a pending organisation so it appears in active organisations', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.searchForOrganisation(userName);
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
      await organisationApprovalsPage.openPendingOrganisationById(organisationIdentifier);
      organisationName = await organisationApprovalsPage.getOrganisationNameFromDetails();
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await organisationApprovalsPage.chooseDecision('Approve it');
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration approved/i)).toBeVisible();
    });

    await test.step('Find the organisation in the active tab and open details', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);

      await organisationApprovalsPage.searchForOrganisation(organisationName);
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);

      await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible();
      await organisationApprovalsPage.openFirstActiveOrganisation();
    });

    await test.step('Delete the active organisation and verify confirmation guidance', async () => {
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await organisationApprovalsPage.deleteActiveOrganisation();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await expect(organisationApprovalsPage.deleteWarningText).toBeVisible();
      await organisationApprovalsPage.deleteActiveOrganisation();
      await expect(organisationApprovalsPage.deletedOrganisationBanner(organisationName)).toBeVisible();
      await expect(organisationApprovalsPage.whatHappensNextHeading).toBeVisible();
      await expect(organisationApprovalsPage.tellOrganisationText).toBeVisible();
      await expect(organisationApprovalsPage.usersRemovedText).toBeVisible();
      await organisationApprovalsPage.goBackToActiveLink.click();
    });
  });
});

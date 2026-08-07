import { test, expect } from '../helpers/fixtures';
import { openProvisionedOrganisationDetails } from '../helpers/organisation-workflow-navigation';

test.describe('Organisation approvals - pending org workflows', { tag: ['@e2e', '@organisations', '@org-workflows'] }, () => {
  test('I can reject a pending org', async ({ page, organisationApprovalsPage, organisationIdentifier }) => {
    await test.step('Open the provisioned pending organisation', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
    });

    await test.step('Reject the pending organisation', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(await organisationApprovalsPage.chooseDecision('Reject it')).toBeChecked();
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide();
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration rejected/i)).toBeVisible();
    });
  });

  test('I can place registration under review for a pending org', async ({
    page,
    organisationApprovalsPage,
    organisationIdentifier
  }) => {
    await test.step('Open the provisioned pending organisation', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
    });

    await test.step('Place the registration under review', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(await organisationApprovalsPage.chooseDecision(/Place registration under review/i)).toBeChecked();
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide();
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration put under/i)).toBeVisible();
    });

    await test.step('Open the reviewed registration by identifier', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(organisationApprovalsPage.organisationStatusBadge).toHaveText('UNDER REVIEW');
    });
  });

  test('I can approve a pending organisation', async ({ page, organisationApprovalsPage, organisationIdentifier }) => {
    await test.step('Open the provisioned pending organisation', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
    });

    await test.step('Approve the pending organisation and open the resulting record by identifier', async () => {
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(await organisationApprovalsPage.chooseDecision('Approve it')).toBeChecked();
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration approved/i)).toBeVisible();

      await openProvisionedOrganisationDetails(page, organisationIdentifier);
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(organisationApprovalsPage.deleteOrganisationDetailsButton).toBeVisible();
    });
  });

  test('i can delete an active org', async ({ organisationApprovalsPage, userName, organisationIdentifier }) => {
    let organisationName = '';

    await test.step('Approve a pending organisation so it appears in active organisations', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.searchForOrganisation(userName);
      await expect(organisationApprovalsPage.pendingOrganisationRowById(organisationIdentifier)).toBeVisible();
      await organisationApprovalsPage.openPendingOrganisationById(organisationIdentifier);
      organisationName = await organisationApprovalsPage.getOrganisationNameFromDetails();
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(await organisationApprovalsPage.chooseDecision('Approve it')).toBeChecked();
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

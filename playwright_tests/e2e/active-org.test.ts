import { test, expect } from '../helpers/fixtures';
import { openProvisionedOrganisationDetails } from '../helpers/organisation-workflow-navigation';

test.describe('Active organisation details', { tag: ['@e2e', '@organisations', '@active-org'] }, () => {
  test('i can see organisation details for an active org', async ({
    page,
    organisationApprovalsPage,
    organisationIdentifier
  }) => {
    await test.step('Approve the provisioned pending organisation', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
      await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(await organisationApprovalsPage.chooseDecision('Approve it')).toBeChecked();
      await organisationApprovalsPage.submitDecision();
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await organisationApprovalsPage.confirmDecision();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.successBanner(/SUCCESS\s*Registration approved/i)).toBeVisible();
    });

    await test.step('Open the exact active organisation and validate its details', async () => {
      await openProvisionedOrganisationDetails(page, organisationIdentifier);
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
      await expect(organisationApprovalsPage.organisationStatusBadge).toHaveText('ACTIVE');
      await expect(organisationApprovalsPage.subNavigation).toBeVisible();
      await expect(organisationApprovalsPage.usersTabLink).toBeVisible();
      await expect(organisationApprovalsPage.adminDetailsHeading).toBeVisible();
      await expect(organisationApprovalsPage.deleteOrganisationDetailsButton).toBeVisible();
    });

    await test.step('Open users tab and verify there are user rows', async () => {
      await organisationApprovalsPage.openUsersTab();
      await expect(organisationApprovalsPage.usersList).toBeVisible();
      const usersRowCount = await organisationApprovalsPage.usersTableRows.count();
      expect(usersRowCount).toBeGreaterThan(0);
    });
  });
});

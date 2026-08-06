import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

const userIdentifier = 'base';

test.describe('Active organisation details', { tag: ['@e2e', '@organisations', '@active-org'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, userIdentifier);
  });

  test('i can see organisation details for an active org', async ({ organisationApprovalsPage }) => {
    await test.step('Open the first active organisation', async () => {
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await organisationApprovalsPage.waitForSpinnerToHide(60_000);
      await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible({ timeout: 30_000 });
      await organisationApprovalsPage.openFirstActiveOrganisation();
    });

    await test.step('Validate organisation details panel', async () => {
      await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
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

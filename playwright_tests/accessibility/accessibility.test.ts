import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { accessibilityCheck } from '../helpers/accessibility';

test.describe('Accessibility: organisation tab states and user upload', { tag: ['@accessibility'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test('pending organisations tab passes baseline accessibility scan', { tag: ['@tabs-states'] }, async ({ organisationApprovalsPage, page }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
    await accessibilityCheck(page, 'Pending organisations tab');
  });

  test('new pbas tab passes baseline accessibility scan', { tag: ['@tabs-states'] }, async ({ organisationApprovalsPage, page }) => {
    await organisationApprovalsPage.openNewPbasTab();
    await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    await accessibilityCheck(page, 'New PBAs tab');
  });

  test('active organisations tab passes baseline accessibility scan', { tag: ['@tabs-states'] }, async ({ organisationApprovalsPage, page }) => {
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    await accessibilityCheck(page, 'Active organisations tab');
  });

  test('user upload surface passes baseline accessibility scan', { tag: ['@user-upload'] }, async ({ organisationApprovalsPage, page }) => {
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.activeOrganisationViewLink()).toBeVisible({ timeout: 30_000 });
    await organisationApprovalsPage.openFirstActiveOrganisation();
    await expect(organisationApprovalsPage.detailsPanel).toBeVisible();

    await organisationApprovalsPage.openUsersTab();
    await expect(organisationApprovalsPage.usersList).toBeVisible();

    const uploadLink = page.getByRole('link', { name: /upload/i }).first();
    const uploadButton = page.getByRole('button', { name: /upload/i }).first();

    if (await uploadLink.isVisible().catch(() => false)) {
      await uploadLink.click();
    } else if (await uploadButton.isVisible().catch(() => false)) {
      await uploadButton.click();
    }

    await expect(
      page
        .locator('input[type="file"], xuilib-user-list, app-org-details-info, app-org-details-info-old')
        .first()
    ).toBeVisible();

    await accessibilityCheck(page, 'User upload surface');
  });
});
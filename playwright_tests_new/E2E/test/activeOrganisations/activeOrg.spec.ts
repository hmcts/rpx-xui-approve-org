import { expect, test } from '../../fixtures';
import { waitForAnyOrganisationStatus } from '../../utils/test-setup/organisationSetup';

test('i can see organsation details for an active org', async ({ page, organisationApprovalsPage, organisationDetailsPage }) => {
  const activeOrganisation = await waitForAnyOrganisationStatus(page, 'ACTIVE');

  await organisationApprovalsPage.openOrganisationDetailsById(activeOrganisation.organisationIdentifier);
  await organisationDetailsPage.openUntilDeleteReady(activeOrganisation.organisationIdentifier, 60_000);
  await expect(page.getByText('Users')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Administrator details' })).toBeVisible();
  await page.getByText('Users').click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.locator('xuilib-user-list')).toBeVisible();
  await expect(page.locator('xuilib-user-list table tbody tr').first()).toBeVisible();
});

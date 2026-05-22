import { test, expect } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import {
  ACTIVE_ORGANISATIONS_TABLE_SELECTOR,
  PENDING_ORGANISATIONS_TABLE_SELECTOR,
  setupCommonOrganisationApiMocks,
  waitForOrganisationNameInTable,
  waitForOrganisationStatusResponse
} from './helpers/ui-api-mocks';

async function expectOrganisationApprovalsUi(page): Promise<void> {
  await ensureAuthenticatedPage(page, 'base');
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toBeVisible();
  await expect(page.locator('app-pending-overview-component')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'New PBAs' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Active organisations' })).toBeVisible();
}

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@seed', '@read', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page }) => {
    const { pendingOrganisations, activeOrganisations } = await setupCommonOrganisationApiMocks(page);
    const pendingResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');

    await expectOrganisationApprovalsUi(page);
    await pendingResponse;
    await waitForOrganisationNameInTable(page, PENDING_ORGANISATIONS_TABLE_SELECTOR, pendingOrganisations[0].name);

    const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await page.getByRole('tab', { name: 'Active organisations' }).click();
    await activeResponse;
    await expect(page.locator('app-prd-org-overview-component')).toBeVisible();
    await waitForOrganisationNameInTable(page, ACTIVE_ORGANISATIONS_TABLE_SELECTOR, activeOrganisations[0].name);
  });
});

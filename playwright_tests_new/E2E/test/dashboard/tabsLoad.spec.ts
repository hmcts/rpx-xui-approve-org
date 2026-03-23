import { expect, test } from '../../fixtures';
import { resolveAppUrl } from '../../utils/test-setup/appConfig';

test('all tabs on login load data', async ({ page }) => {
  await page.goto(resolveAppUrl(''));
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toBeVisible();
  await expect(page.locator('app-pending-overview-component')).toBeVisible();
  await page.getByRole('tab', { name: 'New PBAs' }).click();
  await expect(page.locator('app-pending-pbas')).toBeVisible();
  await page.getByRole('tab', { name: 'Active organisations' }).click();
  await expect(page.locator('app-prd-org-overview-component')).toBeVisible();
});

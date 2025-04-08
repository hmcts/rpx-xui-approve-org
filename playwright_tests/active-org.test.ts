import { test, expect } from '@playwright/test';
import { signIn } from './helpers/login';
import { getTableActionButton, verifyTableHasRows } from './helpers/tables';

test('i can see organsation details for an active org', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.getByRole('tab', { name: 'Active organisations' }).click();
  // await getTableActionButton(page, '//app-prd-org-overview-component/table/thead/tr[2]/td[5]/a').click();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Organisation details Users')).toBeVisible();
  await expect(page.getByText('Users')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Administrator details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete organisation' })).toBeVisible();
  await page.getByText('Users').click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.locator('xuilib-user-list')).toBeVisible();
  expect(verifyTableHasRows(page, '//xuilib-user-list/table')).toBeTruthy();
});


import { test, expect } from '@playwright/test';
import { signIn } from './helpers/login';
import { getTableActionButton, getTableDataByXpath } from './helpers/tables';

test('i can approve a pending org', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Approve it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('div').filter({ hasText: 'SUCCESSRegistration approved' }).nth(1)).toBeVisible();
});

test('i can reject a pending org', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Reject it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('div').filter({ hasText: 'SUCCESSRegistration rejected' }).nth(1)).toBeVisible();
});

test('i can place registration under review for a pending org', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Place registration under').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('div').filter({ hasText: 'SUCCESSRegistration put under' }).nth(1)).toBeVisible();
});

test('i can delete an active org', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  const orgName = await getTableDataByXpath(page, '//app-org-details-info/form/div/dl/div[1]/dd[1]');
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Approve it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('div').filter({ hasText: 'SUCCESSRegistration approved' }).nth(1)).toBeVisible();
  console.log(`${orgName} has been approved`);
  console.log('delete orgName', orgName);
  await page.getByRole('tab', { name: 'Active organisations' }).click();
  await page.getByLabel('Search').click();
  await page.getByLabel('Search').fill(orgName);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('div').filter({ hasText: 'Loading' }).nth(1)).toBeVisible();
  await page.getByRole('link', { name: 'View' }).click();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'Organisation details Users' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: 'Delete organisation' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  await expect(page.getByText('Warning Make sure you have')).toBeVisible();
  await page.getByRole('button', { name: 'Delete organisation' }).click();
  await expect(page.locator('div').filter({ hasText: `${orgName} has been` }).nth(3)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What happens next' })).toBeVisible();
  await expect(page.getByText('You should tell the')).toBeVisible();
  await expect(page.getByText('They\'ve also been removed')).toBeVisible();
  await page.getByRole('link', { name: 'Go back to active' }).click();
  await expect(page.getByRole('heading', { name: 'Active organisations (0)' })).toBeVisible();
  console.log(`${orgName} has been deleted`);
});

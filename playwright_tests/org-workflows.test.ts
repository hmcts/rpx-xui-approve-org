import { test, expect } from './helpers/fixtures';
import { signIn } from './helpers/login';
import { getTableActionButton, getTableDataByXpath } from './helpers/tables';

test('i can approve a pending org', async ({ page, userName }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.locator('#search').fill(userName);
  await page.getByRole('button', { name: 'Search' }).click();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Approve it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  const spinner = page.locator('div.spinner-inner-container .spinner');
  page.getByRole('button', { name: 'Confirm' }).click();
  await spinner.waitFor({ state: 'hidden', timeout: 15_000 });
  const successDivs = await page.locator('div').filter({ hasText: /SUCCESS\s*Registration approved/i });
  await expect(successDivs.first()).toBeVisible({ timeout: 5000 });
});

test('i can reject a pending org', async ({ page, userName }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.locator('#search').fill(userName);
  await page.getByRole('button', { name: 'Search' }).click();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Reject it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  const spinner = page.locator('div.spinner-inner-container .spinner');
  page.getByRole('button', { name: 'Confirm' }).click();
  await spinner.waitFor({ state: 'hidden', timeout: 15_000 });
  const rejectDivs = await page.locator('div').filter({ hasText: /SUCCESS\s*Registration rejected/i });
  await expect(rejectDivs.first()).toBeVisible({ timeout: 5000 });
});

test('i can place registration under review for a pending org', async ({ page, userName }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.locator('#search').fill(userName);
  await page.getByRole('button', { name: 'Search' }).click();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Place registration under').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  const spinner = page.locator('div.spinner-inner-container .spinner');
  page.getByRole('button', { name: 'Confirm' }).click();
  await spinner.waitFor({ state: 'hidden', timeout: 15_000 });
  const underDivs = await page.locator('div').filter({ hasText: /SUCCESS\s*Registration put under/i });
  await expect(underDivs.first()).toBeVisible({ timeout: 5000 });
});

test('i can delete an active org', async ({ page, userName }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.locator('#search').fill(userName);
  await page.getByRole('button', { name: 'Search' }).click();
  await getTableActionButton(page, '//app-pending-overview-component/table/thead/tr[2]/td[6]/a').click();
  await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
  const orgName = await getTableDataByXpath(page, '//app-org-details-info/form/div/dl/div[1]/dd[1]');
  await expect(page.locator('app-org-details-info')).toBeVisible();
  await page.getByLabel('Approve it').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
  const spinner = page.locator('div.spinner-inner-container .spinner');
  page.getByRole('button', { name: 'Confirm' }).click();
  await spinner.waitFor({ state: 'hidden', timeout: 30_000 });
  const successDivs = await page.locator('div').filter({ hasText: /SUCCESS\s*Registration approved/i });
  await expect(successDivs.first()).toBeVisible({ timeout: 5000 });
  await page.getByRole('tab', { name: 'Active organisations' }).click();
  await page.waitForTimeout(5000); // small timeout to make sure spinner has had chance to start
  await spinner.waitFor({ state: 'hidden', timeout: 60_000 });
  for (let i = 0; i < 6; i++) {
    // added a loop to retry clicking on the 'Search' link in case of spinner issues
    try {
      if (i !== 0) {
        console.log(`Attempt ${i}: Failed to 'Search' label, retrying...`);
      }
      await page.getByLabel('Search').click();
      break;
    } catch (error) {
      console.error(error);
    }
    await page.waitForTimeout(5000);
  }
  await page.getByLabel('Search').fill(orgName);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(2000); // small timeout to make sure spinner has had chance to start
  await spinner.waitFor({ state: 'hidden', timeout: 60_000 });
  for (let i = 0; i < 6; i++) {
    // added a loop to retry clicking on the 'View' link in case of spinner issues
    try {
      if (i !== 0) {
        console.log(`Attempt ${i}: Failed to click on 'View' link, retrying...`);
      }
      await page.getByRole('link', { name: 'View' }).first().click();
      break;
    } catch (error) {
      console.error(error);
    }
    await page.waitForTimeout(5000);
  }
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
  console.log(`${orgName} has been deleted`);
});

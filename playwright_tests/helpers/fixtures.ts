import { test as base, expect, chromium, type Page } from '@playwright/test';
import { config } from '../config/config';

/**
 * We’ll give tests an extra parameter:
 *   • userName  – the user name created when registering
 */
export const test = base.extend<{
  userName: string;   // value we return from setup
}>({

  /* -------- fixture: log into MO and register org -------- */
  userName: [
    async ({ }, use) => {
      const userName = 'xui-ao-test-' + Date.now().toString();
      // Need a full browser context for cross-domain login
      const ctx = await chromium.launchPersistentContext('', {
        headless: true
      });
      const page = await ctx.newPage();
      // log in
      await page.goto(`${config.registerUrl}/register-org-new/register`);
      await page.getByLabel('I\'ve checked whether my organisation already has an account').click();
      await page.getByRole('button', { name: 'Start' }).click();
      await page.getByLabel('Solicitor').click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByLabel('Enter the name of the organisation').click();
      await page.getByLabel('Enter the name of the organisation').fill(`${userName}-company`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('#postcodeInput').fill('EC1A 1BB');
      await page.getByRole('button', { name: 'Find address' }).click();
      await page.locator('#addressList').selectOption({ label: 'Royal Mail, Mount Pleasant Mail Centre, Farringdon Road, London' });
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByLabel('No').check();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('#regulator-type0').selectOption({ label: 'Not Applicable' });
      await page.getByRole('button', { name: 'Continue' }).click();
      const damagesCheckbox = page.locator('input[data-service-label="Damages"]');
      await expect(damagesCheckbox).toBeVisible();
      await damagesCheckbox.check();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByLabel('No').check();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByLabel('First name').click();
      await page.getByLabel('First name').fill('Test');
      await page.getByLabel('Last name').click();
      await page.getByLabel('Last name').fill('User');
      await page.getByLabel('Enter your work email address').click();
      await page.getByLabel('Enter your work email address').fill(`${userName}@mailinator.com`);
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByLabel('No').check();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.locator('#confirm-terms-and-conditions').click();
      const spinner = page.locator('div.spinner-wrapper');
      await page.getByRole('button', { name: 'Confirm and submit' }).click();
      await page.waitForTimeout(2000);
      await spinner.waitFor({ state: 'hidden', timeout: 30_000 });
      for (let i = 0; i < 6; i++) {
        // added a loop to retry viewing the header in case of spinner issues
        try {
          if (i !== 0) {
            console.log(`Attempt ${i}: Failed to view heading, retrying...`);
          }
          await expect(page.getByRole('heading', { name: 'Registration details submitted' })).toBeVisible();
          break;
        } catch (error) {
          console.error(error);
        }
        await page.waitForTimeout(5000);
      }

      await use(userName);

      // logout/close when the test ends
      await ctx.close();
    }, { auto: true }]
});

export { expect } from '@playwright/test';

import { test, expect } from '@playwright/test';
import { config } from './config/config';

test.describe('Login and logout', () => {

  test.use({ storageState: { cookies: [], origins: [] } });

  test('login and log out from AO with valid user @smoke', async ({ page }) => {
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email address' }).fill(config.base.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(config.base.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    const organisationHeading = page.getByRole('heading', { name: 'Organisation approvals' });
    try {
      await expect(organisationHeading).toBeVisible();
    } catch (error) {
      const authCheckUrl = new URL('auth/isAuthenticated', config.baseUrl).toString();
      const authCheck = await page.request.get(authCheckUrl, { failOnStatusCode: false });
      const authCheckBody = (await authCheck.text()).trim();
      throw new Error(
        `Login did not establish an AO session. Current URL: ${page.url()}. ` +
        `auth/isAuthenticated status=${authCheck.status()} body=${authCheckBody || '<empty>'}. ` +
        `Original assertion error: ${(error as Error).message}`
      );
    }

    await page.getByRole('link', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});

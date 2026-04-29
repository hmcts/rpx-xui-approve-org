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
    await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
    await page.getByRole('link', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});

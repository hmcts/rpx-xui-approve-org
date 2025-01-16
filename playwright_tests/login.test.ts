import { test, expect } from '@playwright/test';
import { signIn } from './helpers/login';

test('login and log out from AO with valid user', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  await page.getByRole('link', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

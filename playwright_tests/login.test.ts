import { test, expect } from '@playwright/test';
import { runAxeAudit } from './helpers/axe';
import { isAuthenticatedByApi, signIn, signOut } from './helpers/login';

test.describe('Login and logout', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('login and log out from AO with valid user @smoke', async ({ page }, testInfo) => {
    await signIn(page);
    await expect(await isAuthenticatedByApi(page)).toBe(true);
    await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await runAxeAudit(page, testInfo, { reportName: 'Authenticated AO landing page' });
    await signOut(page);
    await expect(await isAuthenticatedByApi(page)).toBe(false);
  });
});

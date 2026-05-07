import { test, expect } from '@playwright/test';
import { isAuthenticatedByApi, signIn, signOut } from './helpers/login';

test.describe('Login and logout', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('login and log out from AO with valid user @smoke', async ({ page }) => {
    await signIn(page);
    await expect(await isAuthenticatedByApi(page)).toBe(true);
    await signOut(page);
    await expect(await isAuthenticatedByApi(page)).toBe(false);
  });
});

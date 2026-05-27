import { test, expect } from '@playwright/test';
import { isAuthenticatedByApi, signIn, signOut } from '../helpers/login';

test.describe('Login and logout', { tag: ['@e2e', '@auth', '@smoke'] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('login and log out from AO with valid user', async ({ page }) => {
    await test.step('Sign in and verify authenticated session', async () => {
      await signIn(page);
      const isAuthenticated = await isAuthenticatedByApi(page);
      expect(isAuthenticated).toBe(true);
    });

    await test.step('Sign out and verify session is cleared', async () => {
      await signOut(page);
      const isAuthenticated = await isAuthenticatedByApi(page);
      expect(isAuthenticated).toBe(false);
    });
  });
});

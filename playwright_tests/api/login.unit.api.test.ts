import { expect, Page, test } from '@playwright/test';
import { config } from '../config/config';
import { isAuthenticatedByApi, signOut } from '../helpers/login';

async function openAuthPage(page: Page, authResponse: { status: number; body: string } | 'abort') {
  await page.route('**/*', async (route) => {
    if (new URL(route.request().url()).pathname === '/auth/isAuthenticated') {
      if (authResponse === 'abort') {
        await route.abort('failed');
      } else {
        await route.fulfill({ status: authResponse.status, body: authResponse.body });
      }
      return;
    }

    await route.fulfill({ contentType: 'text/html', body: '<main>Approve organisation</main>' });
  });
  await page.goto('http://auth-test.local/');
}

test('reads a successful authentication response in the browser page context', async ({ page }) => {
  await openAuthPage(page, { status: 200, body: 'true' });

  await expect(isAuthenticatedByApi(page)).resolves.toBe(true);
});

test('rejects false and unsuccessful authentication responses', async ({ page }) => {
  await openAuthPage(page, { status: 200, body: 'false' });
  await expect(isAuthenticatedByApi(page)).resolves.toBe(false);

  await page.unrouteAll();
  await openAuthPage(page, { status: 401, body: 'true' });
  await expect(isAuthenticatedByApi(page)).resolves.toBe(false);
});

test('treats a failed browser-context authentication request as signed out', async ({ page }) => {
  await openAuthPage(page, 'abort');

  await expect(isAuthenticatedByApi(page)).resolves.toBe(false);
});

test('signs out through browser navigation', async ({ page }) => {
  const navigations: string[] = [];
  await page.route('**/*', async (route) => {
    if (route.request().isNavigationRequest()) {
      navigations.push(route.request().url());
    }
    await route.fulfill({ contentType: 'text/html', body: '<main>Approve organisation</main>' });
  });

  await signOut(page);

  expect(navigations).toEqual([
    new URL('auth/logout?noredirect=true', config.baseUrl).toString(),
    new URL(config.baseUrl).toString()
  ]);
});

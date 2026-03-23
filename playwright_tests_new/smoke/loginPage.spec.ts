import { expect, test } from '../common/diagnosticFixtures';
import { openStableLoginPage } from '../E2E/utils/test-setup/auth';

test('IDAM login page is up and displays username and password fields', { tag: ['@e2e', '@e2e-smoke'] }, async ({ page }) => {
  await openStableLoginPage(page);

  await expect(page).toHaveURL(/\/login\?/);
  await expect(page).toHaveTitle(/HMCTS|Sign in/i);
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  const loginUrl = new URL(page.url());
  expect(loginUrl.pathname).toBe('/login');
  expect(loginUrl.searchParams.get('response_type')).toBe('code');
  expect(loginUrl.searchParams.get('client_id')).toBeTruthy();
  expect(loginUrl.searchParams.get('redirect_uri')).toContain('/oauth2/callback');
});

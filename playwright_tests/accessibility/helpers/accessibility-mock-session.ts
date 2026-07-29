import type { Page, Route } from '@playwright/test';
import { config } from '../../config/config';

const MOCK_ENVIRONMENT_CONFIG = {
  configEnv: 'playwright',
  cookies: {
    roles: 'roles',
    token: '__auth__',
    userId: 'userId'
  },
  idamClient: 'xui_webapp',
  oauthCallbackUrl: '/oauth2/callback',
  protocol: 'https',
  services: {
    idamWeb: 'https://idam-web.mock'
  },
  oidcEnabled: true,
  launchDarklyClientId: ''
};

const MOCK_ROLES_COOKIE = encodeURIComponent(JSON.stringify([
  'prd-admin',
  'pui-organisation-manager',
  'pui-user-manager',
  'pui-case-manager'
])).replace(/^/, 'j%3A');

async function fulfillJson(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body)
  });
}

async function seedMockAuthCookies(page: Page): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60;
  const url = new URL(config.baseUrl);
  const cookieBase = {
    url: url.origin,
    secure: url.protocol === 'https:',
    sameSite: 'Lax' as const,
    expires
  };

  await page.context().addCookies([
    { ...cookieBase, name: '__auth__', value: 'mock-auth-token' },
    { ...cookieBase, name: 'Idam.Session', value: 'mock-idam-session' },
    { ...cookieBase, name: 'ao-webapp', value: 'mock-webapp-session', httpOnly: true },
    { ...cookieBase, name: 'roles', value: MOCK_ROLES_COOKIE },
    { ...cookieBase, name: 'XSRF-TOKEN', value: 'mock-xsrf-token' }
  ]);
}

export async function setupAccessibilityMockSession(page: Page): Promise<void> {
  await seedMockAuthCookies(page);

  await page.route('**/auth/isAuthenticated*', async (route) => fulfillJson(route, true));
  await page.route('**/api/healthCheck*', async (route) => fulfillJson(route, { healthState: true }));
  await page.route('**/api/environment/config*', async (route) => fulfillJson(route, MOCK_ENVIRONMENT_CONFIG));
  await page.route('**/*launchdarkly.com/**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({ status: 202, body: '' });
      return;
    }

    await fulfillJson(route, {});
  });
}

export async function openAccessibilityMockApp(page: Page, pathName = '/organisation/pending'): Promise<void> {
  await page.goto(new URL(pathName, config.baseUrl).toString(), { waitUntil: 'domcontentloaded' });
}

import { config } from '../config/config';
import { completeIdamLogin } from './idamLogin';

export async function isAuthenticatedByApi(page: any): Promise<boolean> {
  try {
    const authCheckUrl = new URL('auth/isAuthenticated', config.baseUrl).toString();
    const response = await page.request.get(authCheckUrl, { failOnStatusCode: false });
    if (response.status() !== 200) {
      return false;
    }
    return (await response.text()).trim() === 'true';
  } catch {
    return false;
  }
}

async function waitForAuthenticatedByApi(page: any, timeoutMs = 10_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isAuthenticatedByApi(page)) {
      return true;
    }
    await page.waitForTimeout(Math.min(250, deadline - Date.now()));
  }
  return false;
}

export async function signIn(page: any, user: string = 'base') {
  const { username, password } = config[user];
  console.log('signing in to: ' + config.baseUrl);
  const maxAttempts = 3;
  const authLoginUrl = new URL('auth/login', config.baseUrl).toString();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

    if (await isAuthenticatedByApi(page)) {
      console.log('Signed in as ' + username);
      return;
    }

    try {
      await page.goto(authLoginUrl, { waitUntil: 'domcontentloaded' });
      await completeIdamLogin(page, username, password);

      if (await waitForAuthenticatedByApi(page)) {
        console.log('Signed in as ' + username);
        return;
      }
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
    }

    if (attempt < maxAttempts) {
      console.log('First login attempt failed, retrying...');
      await page.context().clearCookies();
    }
  }

  throw new Error(`Login failed for ${username}. Current URL: ${page.url()}.`);
}

export async function signOut(page: any) {
  const logoutUrl = new URL('auth/logout?noredirect=true', config.baseUrl).toString();
  await page.request.get(logoutUrl, { failOnStatusCode: false });
  await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' }).catch((error) => {
    if (!String(error).includes('ERR_ABORTED')) {
      throw error;
    }
  });
  console.log('Signed out');
}

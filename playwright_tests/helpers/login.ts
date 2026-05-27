import { config } from '../config/config';

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

export async function signIn(page: any, user: string = 'base') {
  const { username, password } = config[user];
  console.log('signing in to: ' + config.baseUrl);
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

    if (await isAuthenticatedByApi(page)) {
      console.log('Signed in as ' + username);
      return;
    }

    await page.waitForSelector('input[name="username"]', { timeout: 60000 });
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('#login-submit-btn');

    // Allow AO callback/auth checks to settle after IDAM submit.
    await page.waitForTimeout(1500 * attempt);

    if (await isAuthenticatedByApi(page)) {
      console.log('Signed in as ' + username);
      return;
    }

    if (attempt < maxAttempts) {
      console.log('First login attempt failed, retrying...');
    }
  }

  throw new Error(`Login failed for ${username}. Current URL: ${page.url()}.`);
}

export async function signOut(page: any) {
  const logoutUrl = new URL('auth/logout?noredirect=true', config.baseUrl).toString();
  await page.request.get(logoutUrl, { failOnStatusCode: false });
  await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
  console.log('Signed out');
}

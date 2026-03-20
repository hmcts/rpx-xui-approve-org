import { config } from '../config/config';

const LOGIN_TIMEOUT_MS = 30_000;
const CALLBACK_REFRESH_LIMIT = 3;

async function isVisible(locator) {
  return locator.isVisible().catch(() => false);
}

async function isCallbackServerError(page) {
  return page.url().includes('/oauth2/callback') && await isVisible(page.getByText('Internal Server Error', { exact: true }));
}

async function waitForSignedIn(page) {
  const organisationApprovalsHeading = page.getByRole('heading', { name: 'Organisation approvals' });
  const deadline = Date.now() + LOGIN_TIMEOUT_MS;
  let refreshCount = 0;

  while (Date.now() < deadline) {
    if (await isVisible(organisationApprovalsHeading)) {
      return true;
    }

    if (await isCallbackServerError(page)) {
      if (refreshCount >= CALLBACK_REFRESH_LIMIT) {
        break;
      }

      refreshCount += 1;
      console.log(`Transient callback error detected, refreshing browser (${refreshCount}/${CALLBACK_REFRESH_LIMIT})...`);
      await page.reload({ waitUntil: 'domcontentloaded' });
      continue;
    }

    await page.waitForTimeout(1_000);
  }

  return isVisible(organisationApprovalsHeading);
}

export async function signIn(page: any, user: string = 'base') {
  const { username, password } = config[user];
  console.log('signing in to: ' + config.baseUrl);

  await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });

  if (await waitForSignedIn(page)) {
    console.log('Signed in as ' + username);
    return;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Ensure fields are visible before interacting
      await page.getByRole('textbox', { name: 'Email address' }).waitFor();
      await page.getByRole('textbox', { name: 'Email address' }).fill(username);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      if (await waitForSignedIn(page)) {
        console.log('Signed in as ' + username);
        return;
      }

      console.log('First login attempt failed, retrying...');
    } catch (error) {
      console.error(`Login attempt ${attempt + 1} failed:`, error);
    }
  }

  throw new Error('Login failed after 2 attempts.');
}

export async function signOut(page) {
  try {
    await page.getByText('Sign out').click();
    console.log('Signed out');
  } catch (error) {
    console.log(`Sign out failed: ${error}`);
  }
}

import { config } from '../config/config';
import { ensureAuthenticatedPage } from './sessionCapture';

export async function signIn(page: any, user: string = 'base') {
  const { username, password } = config[user];
  console.log('signing in to: ' + config.baseUrl);
  void password;
  await ensureAuthenticatedPage(page, user);
  if (page.url().includes('idam') || page.url().includes('/login')) {
    throw new Error(`Login failed for ${username}.`);
  }
  console.log('Signed in as ' + username);
}

export async function signOut(page) {
  try {
    await page.getByText('Sign out').click();
    console.log('Signed out');
  } catch (error) {
    console.log(`Sign out failed: ${error}`);
  }
}

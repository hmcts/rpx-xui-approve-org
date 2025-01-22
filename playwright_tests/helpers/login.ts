import { config } from '../config/config';

export async function signIn(page: any, user: string = 'base') {
  const { username, password } = config[user];
  console.log('signing in to: ' + config.baseUrl);
  await page.goto(config.baseUrl);

  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByLabel('Email address').click();
    await page.getByLabel('Email address').fill(username);
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    const currentUrl = page.url();
    if (!currentUrl.includes('idam')) {
      console.log('Signed in as ' + username);
      return;
    }
    console.log('first login failed, retrying...');
  }
}

export async function signOut(page) {
  try {
    await page.getByText('Sign out').click();
    console.log('Signed out');
  } catch (error) {
    console.log(`Sign out failed: ${error}`);
  }
}

import { expect, test, type Page } from '@playwright/test';
import { completeIdamLogin } from '../helpers/idamLogin';

const idamUrl = 'https://idam-web-public.ithc.platform.hmcts.net/login';
const appUrl = 'https://administer-orgs.ithc.platform.hmcts.net/';

const routeLoginPage = async (page: Page, body: string): Promise<void> => {
  await page.route(idamUrl, async (route) => {
    await route.fulfill({
      body,
      contentType: 'text/html'
    });
  });
  await page.route(appUrl, async (route) => {
    await route.fulfill({
      body: '<html><title>Approve Org</title><body>Signed in</body></html>',
      contentType: 'text/html'
    });
  });
};

test.describe('IDAM login helper', { tag: '@svc-internal' }, () => {
  test('submits the combined email and password page from visible controls', async ({ page }) => {
    await routeLoginPage(
      page,
      `
        <html>
          <body>
            <label for="username">Email address</label>
            <input id="username" name="username" type="email" />
            <label for="password">Password</label>
            <input id="password" name="password" type="password" />
            <button onclick="window.location.href='${appUrl}'">Sign in</button>
          </body>
        </html>
      `
    );

    await page.goto(idamUrl);
    await completeIdamLogin(page, 'user@example.test', 'Password12!');

    await expect(page).toHaveURL(appUrl);
  });

  test('submits the progressive email then password pages from visible controls', async ({ page }) => {
    await routeLoginPage(
      page,
      `
        <html>
          <body>
            <label for="email">Enter your work email address</label>
            <input id="email" name="email" type="email" />
            <button onclick="
              document.body.innerHTML = '<label for=&quot;password&quot;>Password</label><input id=&quot;password&quot; name=&quot;password&quot; type=&quot;password&quot; /><button onclick=&quot;window.location.href=\\'${appUrl}\\'&quot;>Sign in</button>';
            ">Continue</button>
          </body>
        </html>
      `
    );

    await page.goto(idamUrl);
    await completeIdamLogin(page, 'user@example.test', 'Password12!');

    await expect(page).toHaveURL(appUrl);
  });
});

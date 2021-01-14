import * as puppeteer from 'puppeteer';

const username = process.env.TEST_API_EMAIL_ADMIN;
const password = process.env.TEST_API_PASSWORD_ADMIN;
let xsrfCookie = '';
let xxsrfCookie = '';

export async function  authenticateAndGetcookies(url)  {
  console.log( 'Getting Cookie details...');
  const browser = await puppeteer.launch(getPuppeteerLaunchOptions(url));

  const page = await browser.newPage();
  await page.goto(url);
  console.log( 'Loading...');

  try {
    await page.waitForSelector('#username', { visible: true });

    await page.type('#username', username);
    await page.type('#password', password);

    await page.click('.button');
    await page.waitForSelector('.hmcts-header__navigation', { visible: true });
  } catch (error) {
    await browser.close();
    throw error;
  }

  const cookies: [] = await page.cookies();

  let roles = '';
  let webappCookie = '';

  cookies.forEach((cookie: any) => {
    if (cookie.name === 'XSRF-TOKEN') {
      xxsrfCookie = cookie.value;
      xsrfCookie = `XSRF-TOKEN= ${cookie.value}`;
    }
    if (cookie.name === 'roles') {
      roles = `roles= ${cookie.value}`;
    }
    if (cookie.name === 'ao-webapp') {
      webappCookie = `ao-webapp= ${cookie.value}`;
    }

  });
  const finalCookie = `${roles};${webappCookie};${xsrfCookie}`;
  await browser.close();
  return finalCookie;
}

export async function xxsrftoken()  {
  return xxsrfCookie;
}



function getPuppeteerLaunchOptions(url) {
  const puppeteerOption = { ignoreHTTPSErrors: true, headless: true, args: [] };
  if (!url.includes('administer-org.')) {
    puppeteerOption.args.push('--proxy-server=http://proxyout.reform.hmcts.net:8080');
  }

  return puppeteerOption;
}

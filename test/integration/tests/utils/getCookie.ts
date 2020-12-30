import * as puppeteer from 'puppeteer';

const username = 'elvianixui@mailnesia.com';
const password = 'Monday01';

const authCookiesForUsers = {

};

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
 // console.log(cookies);

  let xsrfCookie = '';
  let roles = '';
  let webappCookie = '';

  cookies.forEach((cookie: any) => {
    if (cookie.name === 'XSRF-TOKEN') {
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

function getPuppeteerLaunchOptions(url) {
  const puppeteerOption = { ignoreHTTPSErrors: true, headless: true, args: [] };
  if (!url.includes('administer-org.')) {
    puppeteerOption.args.push('--proxy-server=http://proxyout.reform.hmcts.net:8080');
  }

  return puppeteerOption;
}

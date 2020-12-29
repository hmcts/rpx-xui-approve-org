import * as puppeteer from 'puppeteer';

const username = 'vmuniganti@mailnesia.com';
const password = 'Monday01';

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
  const cookies = await page.cookies();
 // console.log(cookies);

  const xsrfCookie =  `XSRF-TOKEN= ${cookies[0].value}`;

  const roles =  `roles= ${cookies[1].value}`;

  const webappCookie =  `ao-webapp= ${cookies[2].value}`;

  const finalCookie = `${roles};${webappCookie};${xsrfCookie}`

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

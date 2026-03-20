import { resolveAppUrl } from './url';

export async function navigateToUrl(page: any, url: string) {
  const navigationUrl = resolveAppUrl(url);
  await page.goto(navigationUrl);
  console.log('navigated to ' + navigationUrl);
}

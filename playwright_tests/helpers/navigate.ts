import { resolveAppUrl } from './url';

export async function navigateToUrl(page: any, url: string) {
  const navigationUrl = resolveAppUrl(url);
  await page.goto(navigationUrl);
  console.log('navigated to ' + navigationUrl);
}

export async function navigateToOrganisationDetails(page: any, organisationId: string) {
  await navigateToUrl(page, `organisation-details/${organisationId}`);
}

export async function waitForOrganisationDetailsAction(
  page: any,
  organisationId: string,
  actionName: string,
  timeoutMs: number = 60_000
) {
  const deadline = Date.now() + timeoutMs;
  const actionButton = page.getByRole('button', { name: actionName });

  while (Date.now() < deadline) {
    await navigateToOrganisationDetails(page, organisationId);

    if (await actionButton.isVisible().catch(() => false)) {
      return;
    }

    await page.waitForTimeout(Math.min(2_000, deadline - Date.now()));
  }

  throw new Error(`Action ${actionName} was not visible on organisation ${organisationId} within ${timeoutMs}ms`);
}

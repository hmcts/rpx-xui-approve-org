import { expect, type Page } from '@playwright/test';
import { signIn } from '../../../../playwright_tests/helpers/login';
import { resolveAppUrl } from '../../../../playwright_tests/helpers/url';

export class OrganisationApprovalsPage {
  public constructor(private readonly page: Page) {}

  public async signIn() {
    await signIn(this.page);
    await expect(this.page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  }

  public async openOrganisationDetailsById(organisationId: string) {
    await this.page.goto(resolveAppUrl(`organisation-details/${organisationId}`));
  }

  public async openPendingOrganisation(organisationId: string, organisationName: string) {
    await this.page.locator('#search').fill(organisationName);
    await this.page.getByRole('button', { name: 'Search' }).click();

    const organisationRow = this.page.locator('table tr').filter({ hasText: organisationName }).filter({ hasText: organisationId }).first();
    await expect(organisationRow).toBeVisible({ timeout: 15_000 });
    await organisationRow.getByRole('link', { name: 'View' }).click();
  }

  public async openActiveOrganisation(organisationName: string, timeoutMs: number = 180_000) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      await this.page.goto(resolveAppUrl(''));
      await expect(this.page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible({ timeout: 15_000 });
      await this.page.getByRole('tab', { name: 'Active organisations' }).click();
      await this.page.locator('#search').fill(organisationName);
      await this.page.getByRole('button', { name: 'Search' }).click();

      const organisationRow = this.page.locator('table tr').filter({ hasText: organisationName }).first();
      const detailsLink = organisationRow.getByRole('link', { name: 'View' });

      if (await detailsLink.isVisible().catch(() => false)) {
        await detailsLink.click();
        return;
      }

      const remainingTimeMs = deadline - Date.now();
      if (remainingTimeMs > 0) {
        await this.page.waitForTimeout(Math.min(5_000, remainingTimeMs));
      }
    }

    throw new Error(`Active organisation ${organisationName} was not visible within ${timeoutMs}ms`);
  }
}

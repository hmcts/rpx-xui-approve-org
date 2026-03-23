import { expect, type Page } from '@playwright/test';
import { signIn } from '../../utils/test-setup/auth';
import { resolveAppUrl } from '../../utils/test-setup/appConfig';
import { logger } from '../../utils/logger.utils';

export class OrganisationApprovalsPage {
  public constructor(private readonly page: Page) {}

  private serviceErrorHeading() {
    return this.page.getByRole('heading', { name: 'Sorry, there is a problem with the service' });
  }

  private async waitForIdle(timeoutMs: number = 15_000) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page
      .locator('div.spinner-container')
      .first()
      .waitFor({ state: 'hidden', timeout: timeoutMs })
      .catch(() => undefined);
  }

  private async searchForOrganisation(organisationName: string) {
    const searchInput = this.page.locator('#search');
    await this.waitForIdle();
    await searchInput.fill(organisationName);
    await this.waitForIdle();
    await searchInput.press('Enter');
    await this.waitForIdle();
  }

  public async signIn() {
    await signIn(this.page);
    await expect(this.page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
  }

  public async openOrganisationDetailsById(organisationId: string) {
    logger.info('Opening organisation details directly', { organisationId });
    await this.page.goto(resolveAppUrl(`organisation-details/${organisationId}`));
    await this.waitForIdle();
  }

  public async openPendingOrganisation(organisationId: string, organisationName: string) {
    logger.info('Opening pending organisation from approvals list', { organisationId, organisationName });
    await this.page.goto(resolveAppUrl(''));
    await expect(this.page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
    await this.searchForOrganisation(organisationName);

    const organisationRow = this.page
      .locator('table tr')
      .filter({ hasText: organisationName })
      .filter({ hasText: organisationId })
      .first();
    await expect(organisationRow).toBeVisible({ timeout: 15_000 });
    await organisationRow.getByRole('link', { name: 'View' }).click();
  }
}

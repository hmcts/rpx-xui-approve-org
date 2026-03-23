import { expect, type Page } from '@playwright/test';
import { resolveAppUrl } from '../../utils/test-setup/appConfig';
import { logger } from '../../utils/logger.utils';

export class OrganisationDetailsPage {
  public constructor(private readonly page: Page) {}

  private serviceErrorHeading() {
    return this.page.getByRole('heading', { name: 'Sorry, there is a problem with the service' });
  }

  public async expectPendingDecisionPage() {
    await expect(this.page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
    await expect(this.page.locator('app-org-details-info')).toBeVisible();
  }

  public async submitDecision(decisionLabel: string, successPattern: RegExp) {
    logger.info('Submitting organisation decision', { decisionLabel, currentUrl: this.page.url() });
    await this.page.getByLabel(decisionLabel).check();
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await expect(this.page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();

    const spinner = this.page.locator('div.spinner-inner-container .spinner');
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await spinner.waitFor({ state: 'hidden', timeout: 30_000 });

    const successMessage = this.page.locator('div').filter({ hasText: successPattern }).first();
    await expect(successMessage).toBeVisible({ timeout: 5_000 });
  }

  public async expectDeleteReady() {
    await expect(this.page.locator('h1')).toBeVisible();
    await expect(this.page.locator('div').filter({ hasText: 'Organisation details Users' }).nth(1)).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Delete organisation' })).toBeVisible({ timeout: 30_000 });
  }

  public async openUntilDeleteReady(organisationId: string, timeoutMs: number = 120_000) {
    const deadline = Date.now() + timeoutMs;
    const deleteOrganisationButton = this.page.getByRole('button', { name: 'Delete organisation' });

    while (Date.now() < deadline) {
      logger.debug('Refreshing organisation details while waiting for delete action', { organisationId });
      await this.page.goto(resolveAppUrl(`organisation-details/${organisationId}`));
      await this.page.waitForLoadState('domcontentloaded');

      if (
        await this.serviceErrorHeading()
          .isVisible()
          .catch(() => false)
      ) {
        logger.warn('Organisation details page returned service error while waiting for delete action', {
          organisationId,
          currentUrl: this.page.url(),
        });
        const remainingTimeMs = deadline - Date.now();
        if (remainingTimeMs > 0) {
          await this.page.waitForTimeout(Math.min(5_000, remainingTimeMs));
        }
        continue;
      }

      if (await deleteOrganisationButton.isVisible().catch(() => false)) {
        return;
      }

      const visibilityWaitRemainingTimeMs = deadline - Date.now();
      if (visibilityWaitRemainingTimeMs > 0) {
        const ready = await deleteOrganisationButton
          .waitFor({
            state: 'visible',
            timeout: Math.min(1_000, visibilityWaitRemainingTimeMs),
          })
          .then(() => true)
          .catch(() => false);

        if (ready) {
          return;
        }
      }

      const sleepRemainingTimeMs = deadline - Date.now();
      if (sleepRemainingTimeMs > 0) {
        await this.page.waitForTimeout(Math.min(1_000, sleepRemainingTimeMs));
      }
    }

    throw new Error(`Delete organisation was not visible on organisation ${organisationId} within ${timeoutMs}ms`);
  }

  public async deleteOrganisation(organisationName: string) {
    logger.info('Deleting organisation', { organisationName, currentUrl: this.page.url() });
    await this.page.getByRole('button', { name: 'Delete organisation' }).click();
    await expect(this.page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
    await expect(this.page.getByText('Warning Make sure you have')).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete organisation' }).click();
    await expect(
      this.page
        .locator('div')
        .filter({ hasText: `${organisationName} has been` })
        .nth(3)
    ).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'What happens next' })).toBeVisible();
    await expect(this.page.getByText('You should tell the')).toBeVisible();
    await expect(this.page.getByText("They've also been removed")).toBeVisible();
  }
}

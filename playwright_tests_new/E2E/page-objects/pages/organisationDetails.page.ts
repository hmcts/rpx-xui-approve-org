import { expect, type Page } from '@playwright/test';

export class OrganisationDetailsPage {
  public constructor(private readonly page: Page) {}

  public async expectPendingDecisionPage() {
    await expect(this.page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
    await expect(this.page.locator('app-org-details-info')).toBeVisible();
  }

  public async submitDecision(decisionLabel: string, successPattern: RegExp) {
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

  public async deleteOrganisation(organisationName: string) {
    await this.page.getByRole('button', { name: 'Delete organisation' }).click();
    await expect(this.page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
    await expect(this.page.getByText('Warning Make sure you have')).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete organisation' }).click();
    await expect(this.page.locator('div').filter({ hasText: `${organisationName} has been` }).nth(3)).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'What happens next' })).toBeVisible();
    await expect(this.page.getByText('You should tell the')).toBeVisible();
    await expect(this.page.getByText('They\'ve also been removed')).toBeVisible();
  }
}

import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../base';

export class UpdatePbaPage extends BasePage {
  readonly contentMain = this.page.locator('main#main-content, main#content').first();
  readonly updatePbaForm = this.contentMain.locator('form').first();
  readonly heading = this.contentMain.locator('h1.hmcts-page-heading__title, h1.govuk-heading-xl').first();
  readonly pbaInput = this.updatePbaForm.locator('#pba1');
  readonly addAnotherPbaButton = this.updatePbaForm.locator('button[type="button"].hmcts-button--secondary').first();
  readonly removePbaButtons = this.updatePbaForm.locator('button[type="button"].hmcts-search__button.govuk-button--secondary');
  readonly submitButton = this.updatePbaForm.locator('button[type="submit"].govuk-button').first();
  readonly validationSummary = this.contentMain.locator('.govuk-error-summary').first();
  readonly pbaInputError = this.updatePbaForm
    .locator('#pba1-error, #pba1-error-message, .govuk-form-group--error .govuk-error-message')
    .first();

  constructor(page: Page) {
    super(page);
  }

  async updatePbaNumber(pbaNumber: string): Promise<void> {
    await this.pbaInput.fill(pbaNumber);
  }

  pbaInputAt(index: number): Locator {
    return this.updatePbaForm.locator(`#pba${index}`);
  }

  removePbaButtonAt(index: number): Locator {
    return this.removePbaButtons.nth(index - 1);
  }

  async addAnotherPbaNumber(): Promise<void> {
    await this.addAnotherPbaButton.click();
  }

  async updatePbaNumberAt(index: number, pbaNumber: string): Promise<void> {
    await this.pbaInputAt(index).fill(pbaNumber);
  }

  async removePbaNumberAt(index: number): Promise<void> {
    await this.removePbaButtonAt(index).click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

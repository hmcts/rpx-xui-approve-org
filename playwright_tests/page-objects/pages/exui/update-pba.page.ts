import type { Page } from '@playwright/test';
import { BasePage } from '../../base';

export class UpdatePbaPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: 'Organisation payment by account (PBA) number' });
  readonly pbaInput = this.page.locator('#pba1');
  readonly submitButton = this.page.getByRole('button', { name: 'Submit' });

  constructor(page: Page) {
    super(page);
  }

  async updatePbaNumber(pbaNumber: string): Promise<void> {
    await this.pbaInput.fill(pbaNumber);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

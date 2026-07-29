import type { Page } from '@playwright/test';
import { BasePage } from '../../base';

export class ErrorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  readonly contentMain = this.page.locator('main#content').first();
  readonly heading = this.contentMain.locator('h1.govuk-heading-xl').first();
  readonly body = this.contentMain.locator('p.govuk-body').first();
}

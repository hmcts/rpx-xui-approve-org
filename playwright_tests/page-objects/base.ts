import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}
}

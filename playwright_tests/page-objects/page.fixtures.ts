import { test as base } from '@playwright/test';
import { OrganisationApprovalsPage, UpdatePbaPage } from './pages';

export interface PageFixtures {
  organisationApprovalsPage: OrganisationApprovalsPage;
  updatePbaPage: UpdatePbaPage;
}

export const pageFixtures: Parameters<typeof base.extend<PageFixtures>>[0] = {
  organisationApprovalsPage: async ({ page }, use) => {
    await use(new OrganisationApprovalsPage(page));
  },

  updatePbaPage: async ({ page }, use) => {
    await use(new UpdatePbaPage(page));
  }
};

export const test = base.extend<PageFixtures>(pageFixtures);

export { expect } from '@playwright/test';

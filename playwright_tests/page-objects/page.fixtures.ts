import { test as base } from '@playwright/test';
import { OrganisationApprovalsPage } from './pages';

export interface PageFixtures {
  organisationApprovalsPage: OrganisationApprovalsPage;
}

export const pageFixtures: Parameters<typeof base.extend<PageFixtures>>[0] = {
  organisationApprovalsPage: async ({ page }, use) => {
    await use(new OrganisationApprovalsPage(page));
  }
};

export const test = base.extend<PageFixtures>(pageFixtures);

export { expect } from '@playwright/test';
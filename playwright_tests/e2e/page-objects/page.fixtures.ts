import { test as base } from '@playwright/test';
import { OrganisationApprovalsPage } from './pages/exui/organisation-approvals.page';

type PageFixtures = {
  organisationApprovalsPage: OrganisationApprovalsPage;
};

export const test = base.extend<PageFixtures>({
  organisationApprovalsPage: async ({ page }, use) => {
    await use(new OrganisationApprovalsPage(page));
  }
});

export { expect } from '@playwright/test';

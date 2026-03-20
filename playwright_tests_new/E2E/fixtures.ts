import { chromium, test as base } from '@playwright/test';
import { OrganisationApprovalsPage } from './page-objects/pages/organisationApprovals.page';
import { OrganisationDetailsPage } from './page-objects/pages/organisationDetails.page';
import { buildOrganisationName, seedPendingOrganisation, waitForOrganisationStatus } from './utils/test-setup/organisationSetup';

type E2EFixtures = {
  userName: string;
  organisationName: string;
  organisationId: string;
  organisationApprovalsPage: OrganisationApprovalsPage;
  organisationDetailsPage: OrganisationDetailsPage;
};

export const test = base.extend<E2EFixtures>({
  userName: [
    async ({ browserName }, use) => {
      void browserName;
      await use(`xui-ao-test-${Date.now().toString()}`);
    },
    { auto: true }
  ],
  organisationName: [
    async ({ userName }, use) => {
      await use(buildOrganisationName(userName));
    },
    { auto: true }
  ],
  organisationId: [
    async ({ browserName, userName, organisationName }, use, testInfo) => {
      void browserName;
      const ctx = await chromium.launchPersistentContext('', { headless: true });
      const page = await ctx.newPage();

      try {
        await new OrganisationApprovalsPage(page).signIn();
        await seedPendingOrganisation(page, userName);
        const organisationId = await waitForOrganisationStatus(page, organisationName, 'PENDING,REVIEW');
        await use(organisationId);
      } catch (error) {
        const title = await page.title().catch(() => 'unavailable');
        const bodyText = await page.locator('body').innerText().catch(() => 'unavailable');
        const screenshot = await page.screenshot({ fullPage: true }).catch(() => undefined);

        await testInfo.attach('new-suite-org-setup-debug', {
          body: Buffer.from([
            `URL: ${page.url()}`,
            `Title: ${title}`,
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            '',
            bodyText.slice(0, 4000)
          ].join('\n')),
          contentType: 'text/plain'
        });

        if (screenshot) {
          await testInfo.attach('new-suite-org-setup-debug-screenshot', {
            body: screenshot,
            contentType: 'image/png'
          });
        }

        throw error;
      } finally {
        await ctx.close();
      }
    },
    { auto: true }
  ],
  organisationApprovalsPage: async ({ page }, use) => {
    await use(new OrganisationApprovalsPage(page));
  },
  organisationDetailsPage: async ({ page }, use) => {
    await use(new OrganisationDetailsPage(page));
  }
});

export { expect } from '@playwright/test';

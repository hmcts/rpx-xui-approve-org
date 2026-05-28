import { test as base, chromium } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { pageFixtures, type PageFixtures } from '../page-objects/page.fixtures';
import { registerOrganisationViaExternalEndpoint } from './register-org';

/**
 * We’ll give tests an extra parameter:
 *   • userName  – the user name created when registering
 */
export const test = base.extend<{
  userName: string; // value we return from setup
} & PageFixtures>({

  ...pageFixtures,

  /* -------- fixture: log into MO and register org -------- */
  userName: [
    async ({}, use) => {
      const userName = `xui-ao-test-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
      const ctx = await chromium.launchPersistentContext('', {
        headless: true
      });

      try {
        const page = await ctx.newPage();
        await registerOrganisationViaExternalEndpoint(page, {
          userName,
          firstName: 'Test',
          lastName: 'User'
        });

        await use(userName);
      } finally {
        await ctx.close();
      }
    }, { auto: true }]
});

export { expect } from '@playwright/test';

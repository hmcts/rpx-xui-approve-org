import { test as base } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { pageFixtures, type PageFixtures } from '../page-objects/page.fixtures';
import { registerOrganisationViaExternalApi } from './register-org';

/**
 * We’ll give tests an extra parameter:
 *   • userName                – the user name created when registering
 *   • organisationIdentifier – the organisation id returned by registration
 */

type RegisteredOrganisationFixture = {
  userName: string;
  organisationIdentifier: string;
  pbaNumbers: string[];
};

function formatSetupError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

export const test = base.extend<{
  registeredOrganisation: RegisteredOrganisationFixture;
  userName: string;
  organisationIdentifier: string;
} & PageFixtures>({

  ...pageFixtures,

  /* -------- fixture: register org -------- */
  registeredOrganisation: [
    async ({ browserName }, use, testInfo) => {
      void browserName;
      const userName = `xui-ao-test-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;

      try {
        const registration = await registerOrganisationViaExternalApi({
          userName,
          firstName: 'Test',
          lastName: 'User'
        });
        const organisationIdentifier = registration.organisationIdentifier?.trim();

        if (!organisationIdentifier) {
          throw new Error(
            'Registration completed without an organisationIdentifier. ' +
            `userName=${userName} pbaNumbers=${registration.pbaNumbers.join(',') || 'none'}`
          );
        }

        await use({
          userName,
          organisationIdentifier,
          pbaNumbers: registration.pbaNumbers
        });
      } catch (error) {
        throw new Error(
          `Unable to register organisation for workflow test '${testInfo.title}'. ` +
          `Generated userName=${userName}. Root cause: ${formatSetupError(error)}`
        );
      }
    },
    { auto: true }
  ],

  userName: async ({ registeredOrganisation }, use) => {
    await use(registeredOrganisation.userName);
  },

  organisationIdentifier: async ({ registeredOrganisation }, use) => {
    await use(registeredOrganisation.organisationIdentifier);
  }
});

export { expect } from '@playwright/test';

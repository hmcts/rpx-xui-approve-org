import type { Page } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
import { OrganisationApprovalsPage } from '../../page-objects/pages';
import {
  createMockOrganisation,
  setupStandardOrganisationApprovalsApiMocks
} from '../mocks';

const pendingBacklinkOrganisation = createMockOrganisation({
  organisationIdentifier: 'PENDING-BACKLINK-001',
  name: 'Pending Backlink Org',
  status: 'PENDING',
  paymentAccount: [],
  pendingPaymentAccount: ['PBA1111111']
});

const activeBacklinkOrganisation = createMockOrganisation({
  organisationIdentifier: 'ACTIVE-BACKLINK-001',
  name: 'Active Backlink Org',
  status: 'ACTIVE',
  paymentAccount: ['PBA2222222'],
  pendingPaymentAccount: []
});

const mockedActiveOrganisationUsers = {
  users: [
    {
      userIdentifier: 'BACKLINK-USER-001',
      firstName: 'Taylor',
      lastName: 'Approver',
      email: 'taylor.approver@example.com',
      idamStatus: 'ACTIVE',
      idamStatusCode: 'ACTIVE',
      idamMessage: '',
      roles: ['caseworker']
    }
  ]
};

export type NavigationLinksIntegrationSetup = {
  organisationApprovalsPage: OrganisationApprovalsPage;
  pendingOrganisationId: string;
  pendingOrganisationName: string;
  activeOrganisationId: string;
  activeOrganisationName: string;
};

async function setupOrganisationUsersApiMocks(page: Page): Promise<void> {
  await page.route('**/api/allUserListWithoutRoles?usersOrgId=**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedActiveOrganisationUsers)
    });
  });

  await page.route('**/api/organisations?usersOrgId=**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedActiveOrganisationUsers)
    });
  });
}

export async function setupNavigationLinksIntegrationPage(page: Page): Promise<NavigationLinksIntegrationSetup> {
  await setupStandardOrganisationApprovalsApiMocks(page, {
    organisations: {
      pendingOrganisations: [pendingBacklinkOrganisation],
      activeOrganisations: [activeBacklinkOrganisation],
      singleOrganisationsById: {
        [pendingBacklinkOrganisation.organisationIdentifier]: pendingBacklinkOrganisation,
        [activeBacklinkOrganisation.organisationIdentifier]: activeBacklinkOrganisation
      }
    },
    organisationDeletableById: {
      [activeBacklinkOrganisation.organisationIdentifier]: true
    },
    defaultOrganisationDeletable: true
  });

  await setupOrganisationUsersApiMocks(page);

  await ensureAuthenticatedPage(page, 'base');
  const organisationApprovalsPage = new OrganisationApprovalsPage(page);

  return {
    organisationApprovalsPage,
    pendingOrganisationId: pendingBacklinkOrganisation.organisationIdentifier,
    pendingOrganisationName: pendingBacklinkOrganisation.name,
    activeOrganisationId: activeBacklinkOrganisation.organisationIdentifier,
    activeOrganisationName: activeBacklinkOrganisation.name
  };
}

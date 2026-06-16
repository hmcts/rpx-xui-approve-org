import { expect, type Page } from '@playwright/test';
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

const pendingListUrlPattern = /\/(?:organisation\/pending|pending-organisations)(?:\/?|\?.*)$/;
const activeListUrlPattern = /\/(?:organisation\/active|active-organisation)(?:\/?|\?.*)$/;

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

export async function assertPendingOrganisationListReady(
  organisationApprovalsPage: OrganisationApprovalsPage,
  pendingOrganisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();
}

export async function assertActiveOrganisationListReady(
  organisationApprovalsPage: OrganisationApprovalsPage,
  activeOrganisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
}

export async function assertPendingOrganisationDetailsPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage,
  pendingOrganisationId: string
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/organisation-details/${pendingOrganisationId}`));
  await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
}

export async function assertActiveOrganisationDetailsPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage,
  activeOrganisationId: string
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/organisation-details/${activeOrganisationId}`));
  await expect(organisationApprovalsPage.detailsPanel).toBeVisible();
}

export async function assertPendingOrganisationListPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage,
  pendingOrganisationName: string
): Promise<void> {
  await expect(page).toHaveURL(pendingListUrlPattern);
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingOrganisationName).first()).toBeVisible();
}

export async function assertActiveOrganisationListPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage,
  activeOrganisationName: string
): Promise<void> {
  await expect(page).toHaveURL(activeListUrlPattern);
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeOrganisationName).first()).toBeVisible();
}

export async function assertApproveOrganisationConfirmPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage
): Promise<void> {
  await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
  await expect(page).toHaveURL(/\/approve-organisations(?:\/?|\?.*)$/);
}

export async function assertDeleteOrganisationConfirmPage(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage
): Promise<void> {
  await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
  await expect(page).toHaveURL(/\/delete-organisation(?:\/?|\?.*)$/);
}

export async function assertDeleteOrganisationAvailable(
  organisationApprovalsPage: OrganisationApprovalsPage
): Promise<void> {
  await expect(organisationApprovalsPage.deleteOrganisationDetailsButton).toBeVisible();
}

export async function assertActiveOrganisationUsersVisible(
  organisationApprovalsPage: OrganisationApprovalsPage
): Promise<void> {
  await expect(organisationApprovalsPage.usersList).toBeVisible();
}

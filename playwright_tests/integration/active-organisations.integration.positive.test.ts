import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import {
  getPaginationSummaryPattern,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  waitForOrganisationStatusResponse
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  activeNonMatchingOrganisation,
  activeSearchMatchOrganisation,
  buildActivePaginationOrganisations
} from './test-data/organisation-search.data';

const ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD = {
  view: 'ACTIVE',
  searchRequest: {
    search_filter: '',
    sorting_parameters: [{
      sort_by: 'organisationId',
      sort_order: 'asc'
    }],
    pagination_parameters: {
      page_number: 1,
      page_size: 10
    }
  }
};

const ACTIVE_ORGANISATION = createMockOrganisation({
  organisationIdentifier: 'ACTIVETABLE01',
  name: 'Active Table Mock Org',
  status: 'ACTIVE',
  contactInformation: [{
    addressLine1: '72 Active Avenue',
    addressLine2: 'Table Quarter',
    addressLine3: 'Suite 4',
    townCity: 'Birmingham',
    county: 'West Midlands',
    postCode: 'B1 1AA',
    dxAddress: [{ dxNumber: 'DX 720', dxExchange: 'Birmingham' }]
  }],
  superUser: {
    userIdentifier: 'active-table-admin-id',
    firstName: 'Table',
    lastName: 'Admin',
    email: 'table.admin@example.com'
  },
  paymentAccount: ['PBA7200001'],
  pendingPaymentAccount: [],
  dateApproved: '2024-05-21T00:00:00.000Z'
});

test.describe('Playwright integration: active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page, organisationApprovalsPage }) => {
    const organisationApiMock = await setupCommonOrganisationApiMocks(page, {
      activeOrganisations: [ACTIVE_ORGANISATION]
    });
    const { pendingOrganisations, activeOrganisations } = organisationApiMock;

    await test.step('Open approvals page and verify pending organisations', async () => {
      await ensureAuthenticatedPage(page, 'base');
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingOrganisations[0].name)).toBeVisible();
    });

    await test.step('Open active organisations tab and verify active organisations', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowById(activeOrganisations[0].organisationIdentifier)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationNameCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].name);
      await expect(organisationApprovalsPage.activeOrganisationNameCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].organisationIdentifier);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].addressLine1);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].addressLine2);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].addressLine3);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].townCity);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].county);
      await expect(organisationApprovalsPage.activeOrganisationAddressCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].contactInformation[0].postCode);
      await expect(organisationApprovalsPage.activeOrganisationAdministratorCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(`${activeOrganisations[0].superUser.firstName} ${activeOrganisations[0].superUser.lastName}`);
      await expect(organisationApprovalsPage.activeOrganisationAdministratorCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].superUser.email);
      await expect(organisationApprovalsPage.activeOrganisationDateApprovedCell(activeOrganisations[0].organisationIdentifier))
        .toHaveText('21/05/2024');
      await expect(organisationApprovalsPage.activeOrganisationStatusCell(activeOrganisations[0].organisationIdentifier))
        .toContainText(activeOrganisations[0].status);
      expect(organisationApiMock.getLastActiveSearchPayload()).toEqual(ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD);
    });
  });
});

test.describe('Playwright integration: active organisations search', { tag: ['@integration', '@organisations', '@search'] }, () => {
  test('Search by organisation in active organisations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page);

    await test.step('Open active organisations tab', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    });

    await test.step('Search active organisations by name and verify request', async () => {
      const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
      await activeOrganisationsResponse;
      expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.search_filter)
        .toEqual(ORGANISATION_SEARCH_TERMS.activeByName);
    });

    await test.step('Verify active organisation search result', async () => {
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeSearchMatchOrganisation.name)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeNonMatchingOrganisation.name)).toHaveCount(0);
      expect(standardApiMocks.getLastActiveOrganisationSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.activeByName.toLowerCase());
    });
  });

  test('Pagination in active organisations keeps search term and requests page 2', async ({ page, organisationApprovalsPage }) => {
    const activePaginationOrganisations = buildActivePaginationOrganisations(11);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        activeOrganisations: activePaginationOrganisations
      }
    });

    await test.step('Open active organisations tab', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    });

    await test.step('Search active organisations and verify first-page request', async () => {
      const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activePagination);
      await activeOrganisationsResponse;
      expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest).toMatchObject({
        search_filter: ORGANISATION_SEARCH_TERMS.activePagination,
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activePaginationOrganisations[0].name)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[10].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(1, 10, activePaginationOrganisations.length));
    });

    await test.step('Open active organisation page 2 and verify request', async () => {
      const expectedSecondPageOrganisation = activePaginationOrganisations[10];
      const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
      await organisationApprovalsPage.openPaginationPage(2);
      await activeOrganisationsResponse;
      expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest).toMatchObject({
        search_filter: ORGANISATION_SEARCH_TERMS.activePagination,
        pagination_parameters: {
          page_number: 2,
          page_size: 10
        }
      });
      await expect(organisationApprovalsPage.activeOrganisationDataRows).toHaveCount(1);
      await expect(organisationApprovalsPage.activeOrganisationDataRows.first()).toContainText(expectedSecondPageOrganisation.name);
      await expect(organisationApprovalsPage.activeOrganisationDataRows.first()).toContainText(expectedSecondPageOrganisation.organisationIdentifier);
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[0].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(11, 11, activePaginationOrganisations.length));
    });
  });
});

import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import {
  getPaginationSummaryPattern,
  organisationTableRowsFromMockData,
  setupOrganisationSearchIntegrationPage,
} from './helpers/organisation-search.helpers';
import { createMockOrganisation, setupCommonOrganisationApiMocks, waitForOrganisationStatusResponse } from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  buildActivePaginationOrganisations,
  buildActiveSearchOrganisations,
} from './test-data/organisation-search.data';

const ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD = {
  view: 'ACTIVE',
  searchRequest: {
    search_filter: '',
    sorting_parameters: [
      {
        sort_by: 'organisationId',
        sort_order: 'asc',
      },
    ],
    pagination_parameters: {
      page_number: 1,
      page_size: 10,
    },
  },
};

const ACTIVE_ORGANISATIONS = [
  createMockOrganisation({
    organisationIdentifier: 'ACTIVETABLE01',
    name: 'Active Table Mock Org One',
    status: 'ACTIVE',
    contactInformation: [
      {
        addressLine1: '72 Active Avenue',
        addressLine2: 'Table Quarter',
        addressLine3: 'Suite 4',
        townCity: 'Birmingham',
        county: 'West Midlands',
        postCode: 'B1 1AA',
        dxAddress: [{ dxNumber: 'DX 720', dxExchange: 'Birmingham' }],
      },
    ],
    superUser: {
      userIdentifier: 'active-table-admin-one-id',
      firstName: 'Table',
      lastName: 'Admin',
      email: 'table.admin@example.com',
    },
    paymentAccount: ['PBA7200001'],
    pendingPaymentAccount: [],
    dateApproved: '2024-05-21T00:00:00.000Z',
  }),
  createMockOrganisation({
    organisationIdentifier: 'ACTIVETABLE02',
    name: 'Active Table Mock Org Two',
    status: 'ACTIVE',
    contactInformation: [
      {
        addressLine1: '14 Second Street',
        addressLine2: 'Active Quarter',
        addressLine3: 'Floor 2',
        townCity: 'Manchester',
        county: 'Greater Manchester',
        postCode: 'M1 1AA',
        dxAddress: [{ dxNumber: 'DX 721', dxExchange: 'Manchester' }],
      },
    ],
    superUser: {
      userIdentifier: 'active-table-admin-two-id',
      firstName: 'Second',
      lastName: 'Admin',
      email: 'second.admin@example.com',
    },
    paymentAccount: ['PBA7200002'],
    pendingPaymentAccount: [],
    dateApproved: '2024-05-22T00:00:00.000Z',
  }),
];

test.describe('Playwright integration: active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Active organisations tab renders mocked active organisations', async ({ page, organisationApprovalsPage }) => {
    const organisationApiMock = await setupCommonOrganisationApiMocks(page, {
      activeOrganisations: ACTIVE_ORGANISATIONS,
    });
    const { activeOrganisations } = organisationApiMock;

    await test.step('Open approvals page and verify active organisations tab is available', async () => {
      await ensureAuthenticatedPage(page, 'base');
      await expect(organisationApprovalsPage.heading).toBeVisible();
      await expect(organisationApprovalsPage.tabPanel).toBeVisible();
      await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
      await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
    });

    await test.step('Open active organisations tab and verify active organisations', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      expect(await organisationApprovalsPage.activeOrganisationTableRows()).toEqual(
        organisationTableRowsFromMockData(activeOrganisations)
      );
      expect(organisationApiMock.getLastActiveSearchPayload()).toEqual(ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD);
    });
  });
});

test.describe(
  'Playwright integration: active organisations search',
  { tag: ['@integration', '@organisations', '@search'] },
  () => {
    test('Search by organisation in active organisations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
      const activeSearchOrganisations = buildActiveSearchOrganisations(10);
      const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeOrganisations: activeSearchOrganisations,
        },
      });

      await test.step('Open active organisations tab', async () => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      });

      await test.step('Search active organisations by name and verify request', async () => {
        const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
        await activeOrganisationsResponse;
        expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.search_filter).toEqual(
          ORGANISATION_SEARCH_TERMS.activeByName
        );
      });

      await test.step('Verify active organisation search results', async () => {
        const activeOrganisationRows = await organisationApprovalsPage.activeOrganisationTableRows();
        expect(activeOrganisationRows).toEqual(organisationTableRowsFromMockData(activeSearchOrganisations));
        expect(standardApiMocks.getLastActiveOrganisationSearchTerm()).toEqual(
          ORGANISATION_SEARCH_TERMS.activeByName.toLowerCase()
        );
      });

      await test.step('Verify pagination is not shown for 10 active organisations', async () => {
        expect(await organisationApprovalsPage.activeOrganisationTableRows()).toHaveLength(10);
        await expect(organisationApprovalsPage.pagination).toHaveCount(0);
      });
    });

    test('Search by organisation in active organisations shows empty table for empty 200 response', async ({
      page,
      organisationApprovalsPage,
    }) => {
      const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeOrganisations: [],
        },
      });

      await test.step('Open active organisations tab', async () => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      });

      await test.step('Search active organisations and verify empty response request', async () => {
        const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
        await activeOrganisationsResponse;
        expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest).toMatchObject({
          search_filter: ORGANISATION_SEARCH_TERMS.activeByName,
          pagination_parameters: {
            page_number: 1,
            page_size: 10,
          },
        });
      });

      await test.step('Verify active organisations empty response state', async () => {
        expect(await organisationApprovalsPage.activeOrganisationTableRows()).toEqual([]);
        await expect(organisationApprovalsPage.pagination).toHaveCount(0);
      });
    });

    test('Pagination in active organisations keeps search term and requests page 2', async ({
      page,
      organisationApprovalsPage,
    }) => {
      const activePaginationOrganisations = buildActivePaginationOrganisations(11);
      const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeOrganisations: activePaginationOrganisations,
        },
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
            page_size: 10,
          },
        });
        expect(await organisationApprovalsPage.activeOrganisationTableRows()).toEqual(
          organisationTableRowsFromMockData(activePaginationOrganisations.slice(0, 10))
        );
        await expect(organisationApprovalsPage.pagination).toContainText(
          getPaginationSummaryPattern(1, 10, activePaginationOrganisations.length)
        );
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
            page_size: 10,
          },
        });
        await expect(organisationApprovalsPage.searchInput).toHaveValue(ORGANISATION_SEARCH_TERMS.activePagination);
        expect(await organisationApprovalsPage.activeOrganisationTableRows()).toEqual(
          organisationTableRowsFromMockData([expectedSecondPageOrganisation])
        );
        await expect(organisationApprovalsPage.pagination).toContainText(
          getPaginationSummaryPattern(11, 11, activePaginationOrganisations.length)
        );
      });
    });
  }
);

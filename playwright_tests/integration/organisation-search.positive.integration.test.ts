import { test } from './helpers/integration.fixtures';
import {
  waitForOrganisationStatusResponse,
  waitForPendingPbaStatusResponse
} from './mocks';
import {
  assertActiveOrganisationPageRequested,
  assertActiveOrganisationPageRows,
  assertActiveOrganisationSearchResult,
  assertPaginatedOrganisationIds,
  assertPaginationSummary,
  assertPendingOrganisationPageRequested,
  assertPendingOrganisationPageRows,
  assertPendingOrganisationSearchResult,
  assertPendingPbaPageRequested,
  assertPendingPbaPageRows,
  assertPendingPbaSearchResult,
  openPaginationPage,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import {
  ORGANISATION_SEARCH_TERMS,
  activeNonMatchingOrganisation,
  activeSearchMatchOrganisation,
  buildActivePaginationOrganisations,
  buildPendingPaginationOrganisations,
  buildPendingPbaPaginationOrganisations,
  pendingNonMatchingOrganisation,
  pendingPbaNonMatchingOrganisation,
  pendingPbaSearchMatchOrganisation,
  pendingSearchMatchOrganisation
} from './test-data/organisation-search.data';

test.describe('Playwright integration: organisation search', { tag: ['@integration', '@organisations', '@search'] }, () => {
  test('Search by organisation in new registrations uses mocked search API', async ({ page }) => {
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page);

    const pendingSearchResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    await pendingSearchResponse;

    await assertPendingOrganisationSearchResult(
      organisationApprovalsPage,
      standardApiMocks,
      pendingSearchMatchOrganisation.name,
      pendingNonMatchingOrganisation.name,
      ORGANISATION_SEARCH_TERMS.pendingByName
    );
  });

  test('Search by organisation in active organisations uses mocked search API', async ({ page }) => {
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page);

    const activeInitialResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeInitialResponse;

    const activeSearchResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
    await activeSearchResponse;

    await assertActiveOrganisationSearchResult(
      organisationApprovalsPage,
      standardApiMocks,
      activeSearchMatchOrganisation.name,
      activeNonMatchingOrganisation.name,
      ORGANISATION_SEARCH_TERMS.activeByName
    );
  });

  test('Search by address in new registrations uses mocked search API', async ({ page }) => {
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page);

    const pendingSearchResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByAddress);
    await pendingSearchResponse;

    await assertPendingOrganisationSearchResult(
      organisationApprovalsPage,
      standardApiMocks,
      pendingSearchMatchOrganisation.name,
      pendingNonMatchingOrganisation.name,
      ORGANISATION_SEARCH_TERMS.pendingByAddress
    );
  });

  test('Search by organisation in new PBAs uses mocked search API', async ({ page }) => {
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page);

    const pendingPbaInitialResponse = waitForPendingPbaStatusResponse(page);
    await organisationApprovalsPage.openNewPbasTab();
    await pendingPbaInitialResponse;

    const pendingPbaSearchResponse = waitForPendingPbaStatusResponse(page);
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
    await pendingPbaSearchResponse;

    await assertPendingPbaSearchResult(
      organisationApprovalsPage,
      standardApiMocks,
      pendingPbaSearchMatchOrganisation.organisationName,
      pendingPbaNonMatchingOrganisation.organisationName,
      ORGANISATION_SEARCH_TERMS.pendingPbaByName
    );
  });

  test('Pagination in new registrations keeps search term and requests page 2', async ({ page }) => {
    const pendingPaginationOrganisations = buildPendingPaginationOrganisations(11);
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingPaginationOrganisations
      }
    });

    const pendingSearchResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPagination);
    await assertPaginatedOrganisationIds(
      pendingSearchResponse,
      pendingPaginationOrganisations.length,
      pendingPaginationOrganisations.slice(0, 10).map((organisation) => organisation.organisationIdentifier)
    );

    await assertPendingOrganisationPageRows(
      organisationApprovalsPage,
      pendingPaginationOrganisations[0].name,
      pendingPaginationOrganisations[10].name
    );
    await assertPaginationSummary(page, 1, 10, pendingPaginationOrganisations.length);

    const pageTwoResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await openPaginationPage(page, 2);
    await assertPaginatedOrganisationIds(
      pageTwoResponse,
      pendingPaginationOrganisations.length,
      pendingPaginationOrganisations.slice(10).map((organisation) => organisation.organisationIdentifier)
    );

    assertPendingOrganisationPageRequested(standardApiMocks, 2);
    await assertPendingOrganisationPageRows(
      organisationApprovalsPage,
      pendingPaginationOrganisations[10].name,
      pendingPaginationOrganisations[0].name
    );
    await assertPaginationSummary(page, 11, 11, pendingPaginationOrganisations.length);
  });

  test('Pagination in active organisations keeps search term and requests page 2', async ({ page }) => {
    const activePaginationOrganisations = buildActivePaginationOrganisations(11);
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        activeOrganisations: activePaginationOrganisations
      }
    });

    const activeInitialResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeInitialResponse;

    const activeSearchResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activePagination);
    await assertPaginatedOrganisationIds(
      activeSearchResponse,
      activePaginationOrganisations.length,
      activePaginationOrganisations.slice(0, 10).map((organisation) => organisation.organisationIdentifier)
    );

    await assertActiveOrganisationPageRows(
      organisationApprovalsPage,
      activePaginationOrganisations[0].name,
      activePaginationOrganisations[10].name
    );
    await assertPaginationSummary(page, 1, 10, activePaginationOrganisations.length);

    const pageTwoResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await openPaginationPage(page, 2);
    await assertPaginatedOrganisationIds(
      pageTwoResponse,
      activePaginationOrganisations.length,
      activePaginationOrganisations.slice(10).map((organisation) => organisation.organisationIdentifier)
    );

    assertActiveOrganisationPageRequested(standardApiMocks, 2);
    await assertActiveOrganisationPageRows(
      organisationApprovalsPage,
      activePaginationOrganisations[10].name,
      activePaginationOrganisations[0].name
    );
    await assertPaginationSummary(page, 11, 11, activePaginationOrganisations.length);
  });

  test('Pagination in new PBAs keeps search term and requests page 2', async ({ page }) => {
    const pendingPbaPaginationOrganisations = buildPendingPbaPaginationOrganisations(11);
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaOrganisations: pendingPbaPaginationOrganisations
    });

    const pendingPbaInitialResponse = waitForPendingPbaStatusResponse(page);
    await organisationApprovalsPage.openNewPbasTab();
    await pendingPbaInitialResponse;

    const pendingPbaSearchResponse = waitForPendingPbaStatusResponse(page);
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaPagination);
    await assertPaginatedOrganisationIds(
      pendingPbaSearchResponse,
      pendingPbaPaginationOrganisations.length,
      pendingPbaPaginationOrganisations.slice(0, 10).map((organisation) => organisation.organisationIdentifier)
    );

    await assertPendingPbaPageRows(
      organisationApprovalsPage,
      pendingPbaPaginationOrganisations[0].organisationName,
      pendingPbaPaginationOrganisations[10].organisationName
    );
    await assertPaginationSummary(page, 1, 10, pendingPbaPaginationOrganisations.length);

    const pageTwoResponse = waitForPendingPbaStatusResponse(page);
    await openPaginationPage(page, 2);
    await assertPaginatedOrganisationIds(
      pageTwoResponse,
      pendingPbaPaginationOrganisations.length,
      pendingPbaPaginationOrganisations.slice(10).map((organisation) => organisation.organisationIdentifier)
    );

    assertPendingPbaPageRequested(standardApiMocks, 2);
    await assertPendingPbaPageRows(
      organisationApprovalsPage,
      pendingPbaPaginationOrganisations[10].organisationName,
      pendingPbaPaginationOrganisations[0].organisationName
    );
    await assertPaginationSummary(page, 11, 11, pendingPbaPaginationOrganisations.length);
  });
});

import { test, expect } from './helpers/integration.fixtures';
import {
  waitForOrganisationStatusResponse,
  waitForPendingPbaStatusResponse
} from './mocks';
import {
  getPaginationLocator,
  getPaginationSummaryPattern,
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

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingSearchMatchOrganisation.name).first()).toBeVisible();
    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingNonMatchingOrganisation.name)).toHaveCount(0);
    expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toBe(ORGANISATION_SEARCH_TERMS.pendingByName.toLowerCase());
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

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeSearchMatchOrganisation.name).first()).toBeVisible();
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeNonMatchingOrganisation.name)).toHaveCount(0);
    expect(standardApiMocks.getLastActiveOrganisationSearchTerm()).toBe(ORGANISATION_SEARCH_TERMS.activeByName.toLowerCase());
  });

  test('Search by address in new registrations uses mocked search API', async ({ page }) => {
    const {
      organisationApprovalsPage,
      standardApiMocks
    } = await setupOrganisationSearchIntegrationPage(page);

    const pendingSearchResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByAddress);
    await pendingSearchResponse;

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingSearchMatchOrganisation.name).first()).toBeVisible();
    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingNonMatchingOrganisation.name)).toHaveCount(0);
    expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toBe(ORGANISATION_SEARCH_TERMS.pendingByAddress.toLowerCase());
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

    await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaSearchMatchOrganisation.organisationName).first()).toBeVisible();
    await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaNonMatchingOrganisation.organisationName)).toHaveCount(0);
    expect(standardApiMocks.getLastPendingPbaSearchTerm()).toBe(ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase());
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
    await pendingSearchResponse;

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingPaginationOrganisations[0].name).first()).toBeVisible();
    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingPaginationOrganisations[10].name)).toHaveCount(0);
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(1, 10, pendingPaginationOrganisations.length)
    );

    const pageTwoResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
    await openPaginationPage(page, 2);
    await pageTwoResponse;

    expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toBe(2);
    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingPaginationOrganisations[10].name).first()).toBeVisible();
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(11, 11, pendingPaginationOrganisations.length)
    );
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
    await activeSearchResponse;

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[0].name).first()).toBeVisible();
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[10].name)).toHaveCount(0);
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(1, 10, activePaginationOrganisations.length)
    );

    const pageTwoResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await openPaginationPage(page, 2);
    await pageTwoResponse;

    expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toBe(2);
    await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[10].name).first()).toBeVisible();
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(11, 11, activePaginationOrganisations.length)
    );
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
    await pendingPbaSearchResponse;

    await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaPaginationOrganisations[0].organisationName).first()).toBeVisible();
    await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaPaginationOrganisations[10].organisationName)).toHaveCount(0);
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(1, 10, pendingPbaPaginationOrganisations.length)
    );

    const pageTwoResponse = waitForPendingPbaStatusResponse(page);
    await openPaginationPage(page, 2);
    await pageTwoResponse;

    expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toBe(2);
    await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaPaginationOrganisations[10].organisationName).first()).toBeVisible();
    await expect(getPaginationLocator(page)).toContainText(
      getPaginationSummaryPattern(11, 11, pendingPbaPaginationOrganisations.length)
    );
  });
});

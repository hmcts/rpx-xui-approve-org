import { test, expect } from '../page-objects/page.fixtures';
import {
  getPaginationSummaryPattern,
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
  test('Search by organisation in new registrations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page);

    await test.step('Search pending organisations by name', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    });

    await test.step('Verify pending organisation search result', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingSearchMatchOrganisation.name)).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingNonMatchingOrganisation.name)).toHaveCount(0);
      expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingByName.toLowerCase());
    });
  });

  test('Search by organisation in active organisations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page);

    await test.step('Open active organisations tab', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    });

    await test.step('Search active organisations by name', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
    });

    await test.step('Verify active organisation search result', async () => {
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activeSearchMatchOrganisation.name)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activeNonMatchingOrganisation.name)).toHaveCount(0);
      expect(standardApiMocks.getLastActiveOrganisationSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.activeByName.toLowerCase());
    });
  });

  test('Search by address in new registrations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page);

    await test.step('Search pending organisations by address', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByAddress);
    });

    await test.step('Verify pending organisation address search result', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingSearchMatchOrganisation.name)).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingNonMatchingOrganisation.name)).toHaveCount(0);
      expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingByAddress.toLowerCase());
    });
  });

  test('Search by organisation in new PBAs uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page);

    await test.step('Open new PBAs tab', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    });

    await test.step('Search pending PBAs by organisation name', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
    });

    await test.step('Verify pending PBA search result', async () => {
      await expect(organisationApprovalsPage.pendingPbaRowByText(pendingPbaSearchMatchOrganisation.organisationName)).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaNonMatchingOrganisation.organisationName)).toHaveCount(0);
      expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase());
    });
  });

  test('Pagination in new registrations keeps search term and requests page 2', async ({ page, organisationApprovalsPage }) => {
    const pendingPaginationOrganisations = buildPendingPaginationOrganisations(11);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingPaginationOrganisations
      }
    });

    await test.step('Search pending organisations and verify first page', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPagination);
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingPaginationOrganisations[0].name)).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingPaginationOrganisations[10].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(1, 10, pendingPaginationOrganisations.length));
    });

    await test.step('Open pending organisation page 2 and verify rows', async () => {
      await organisationApprovalsPage.openPaginationPage(2);
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(2);
      await expect(organisationApprovalsPage.pendingOrganisationRowByName(pendingPaginationOrganisations[10].name)).toBeVisible();
      await expect(organisationApprovalsPage.pendingOrganisationRowsByName(pendingPaginationOrganisations[0].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(11, 11, pendingPaginationOrganisations.length));
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

    await test.step('Search active organisations and verify first page', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activePagination);
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activePaginationOrganisations[0].name)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[10].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(1, 10, activePaginationOrganisations.length));
    });

    await test.step('Open active organisation page 2 and verify rows', async () => {
      await organisationApprovalsPage.openPaginationPage(2);
      expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(2);
      await expect(organisationApprovalsPage.activeOrganisationRowByText(activePaginationOrganisations[10].name)).toBeVisible();
      await expect(organisationApprovalsPage.activeOrganisationRowsByText(activePaginationOrganisations[0].name)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(11, 11, activePaginationOrganisations.length));
    });
  });

  test('Pagination in new PBAs keeps search term and requests page 2', async ({ page, organisationApprovalsPage }) => {
    const pendingPbaPaginationOrganisations = buildPendingPbaPaginationOrganisations(11);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaOrganisations: pendingPbaPaginationOrganisations
    });

    await test.step('Open new PBAs tab', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    });

    await test.step('Search pending PBAs and verify first page', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaPagination);
      await expect(organisationApprovalsPage.pendingPbaRowByText(pendingPbaPaginationOrganisations[0].organisationName)).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaPaginationOrganisations[10].organisationName)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(1, 10, pendingPbaPaginationOrganisations.length));
    });

    await test.step('Open pending PBA page 2 and verify rows', async () => {
      await organisationApprovalsPage.openPaginationPage(2);
      expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(2);
      await expect(organisationApprovalsPage.pendingPbaRowByText(pendingPbaPaginationOrganisations[10].organisationName)).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaRowsByText(pendingPbaPaginationOrganisations[0].organisationName)).toHaveCount(0);
      await expect(organisationApprovalsPage.pagination).toContainText(getPaginationSummaryPattern(11, 11, pendingPbaPaginationOrganisations.length));
    });
  });
});

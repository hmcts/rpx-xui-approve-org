import { test, expect } from '../page-objects/page.fixtures';
import {
  getPaginationSummaryPattern,
  pendingPbaTableRowsFromMockData,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import { waitForPendingPbaStatusResponse } from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  buildPendingPbaPaginationOrganisations,
  buildPendingPbaSearchOrganisations
} from './test-data/organisation-search.data';

test.describe('Playwright integration: pending PBAs search', { tag: ['@pending-pbas', '@search', '@positive'] }, () => {
  test('Search by organisation in new PBAs uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const pendingPbaSearchOrganisations = buildPendingPbaSearchOrganisations(10);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaOrganisations: pendingPbaSearchOrganisations
    });

    await test.step('Open new PBAs tab', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    });

    await test.step('Search pending PBAs by organisation name and verify request', async () => {
      const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
      await pendingPbaResponse;
      expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase());
    });

    await test.step('Verify pending PBA search results', async () => {
      const pendingPbaRows = await organisationApprovalsPage.pendingPbaTableRows();
      expect(pendingPbaRows).toEqual(pendingPbaTableRowsFromMockData(pendingPbaSearchOrganisations));
    });

    await test.step('Verify pagination is not shown for 10 pending PBAs', async () => {
      expect(await organisationApprovalsPage.pendingPbaTableRows()).toHaveLength(10);
      await expect(organisationApprovalsPage.pagination).toHaveCount(0);
    });
  });

  test('Search by organisation in new PBAs shows empty state for empty 200 response', async ({
    page,
    organisationApprovalsPage
  }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaOrganisations: []
    });

    await test.step('Open new PBAs tab', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    });

    await test.step('Search pending PBAs and verify empty response request', async () => {
      const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
      await pendingPbaResponse;
      expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest).toMatchObject({
        drill_down_search: [
          {
            field_name: 'pbaPendings',
            search_filter: ORGANISATION_SEARCH_TERMS.pendingPbaByName
          }
        ],
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
    });

    await test.step('Verify pending PBAs empty response state', async () => {
      await expect(organisationApprovalsPage.pendingPbaEmptyState).toBeVisible();
      expect(await organisationApprovalsPage.pendingPbaTableRows()).toEqual([]);
      await expect(organisationApprovalsPage.pagination).toHaveCount(0);
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

    await test.step('Search pending PBAs and verify first-page request', async () => {
      const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaPagination);
      await pendingPbaResponse;
      expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest).toMatchObject({
        drill_down_search: [
          {
            field_name: 'pbaPendings',
            search_filter: ORGANISATION_SEARCH_TERMS.pendingPbaPagination
          }
        ],
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
      expect(await organisationApprovalsPage.pendingPbaTableRows()).toEqual(
        pendingPbaTableRowsFromMockData(pendingPbaPaginationOrganisations.slice(0, 10))
      );
      await expect(organisationApprovalsPage.pagination).toContainText(
        getPaginationSummaryPattern(1, 10, pendingPbaPaginationOrganisations.length)
      );
    });

    await test.step('Open pending PBA page 2 and verify request', async () => {
      const expectedSecondPageOrganisation = pendingPbaPaginationOrganisations[10];
      const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
      await organisationApprovalsPage.openPaginationPage(2);
      await pendingPbaResponse;
      expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest).toMatchObject({
        drill_down_search: [
          {
            field_name: 'pbaPendings',
            search_filter: ORGANISATION_SEARCH_TERMS.pendingPbaPagination
          }
        ],
        pagination_parameters: {
          page_number: 2,
          page_size: 10
        }
      });
      await expect(organisationApprovalsPage.searchInput).toHaveValue(ORGANISATION_SEARCH_TERMS.pendingPbaPagination);
      expect(await organisationApprovalsPage.pendingPbaTableRows()).toEqual(
        pendingPbaTableRowsFromMockData([expectedSecondPageOrganisation])
      );
      await expect(organisationApprovalsPage.pagination).toContainText(
        getPaginationSummaryPattern(11, 11, pendingPbaPaginationOrganisations.length)
      );
    });
  });
});

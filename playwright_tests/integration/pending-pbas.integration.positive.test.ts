import { test, expect } from '../page-objects/page.fixtures';
import {
  getPaginationSummaryPattern,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import {
  ORGANISATION_SEARCH_TERMS,
  buildPendingPbaPaginationOrganisations,
  pendingPbaNonMatchingOrganisation,
  pendingPbaSearchMatchOrganisation
} from './test-data/organisation-search.data';

test.describe('Playwright integration: pending PBAs search', { tag: ['@integration', '@organisations', '@search'] }, () => {
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

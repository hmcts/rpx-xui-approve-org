import { test, expect } from '../page-objects/page.fixtures';
import { setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  waitForPendingPbaStatusResponse,
  waitForPendingPbaStatusResponseWithHttpStatus
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  pendingPbaStatusCodeScenarios
} from './test-data/organisation-search.data';

const ERROR_PAGE_BODY = 'Try again later.';
test.describe(
  'Playwright integration: pending PBAs search negative paths',
  { tag: ['@pending-pbas', '@search', '@negative'] },
  () => {
    for (const scenario of pendingPbaStatusCodeScenarios) {
      test(`Pending PBA search handles HTTP ${scenario.statusCode}`, async ({ page, errorPage, organisationApprovalsPage }) => {
        const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
          pendingPbaSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock pending pba search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        });

        await test.step('Open new PBAs tab', async () => {
          await organisationApprovalsPage.openNewPbasTab();
          await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
        });

        await test.step(`Search pending PBAs with HTTP ${scenario.statusCode} mock`, async () => {
          const pendingPbaResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, scenario.statusCode);
          await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
          await pendingPbaResponse;
          expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(
            ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase()
          );
        });

        await test.step('Verify pending PBA search shows expected error page', async () => {
          await expect(page).toHaveURL(scenario.expectedRedirectPath);
          await expect(errorPage.heading).toBeVisible();
          await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading);
          await expect(errorPage.body).toBeVisible();
          await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY);
        });
      });
    }

    test('Pending PBA search with incomplete response object shows fallback empty-state', async ({
      page,
      organisationApprovalsPage
    }) => {
      const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
        pendingPbaSearchResponse: {
          status: 200,
          body: {
            organisations: [
              {
                organisationIdentifier: 'INCOMPLETEPBA001',
                organisationName: 'Incomplete PBA Org',
                superUser: {
                  firstName: 'Incomplete',
                  lastName: 'Admin',
                  email: 'incomplete-pba-admin@example.com'
                },
                pbaNumbers: [
                  {
                    pbaNumber: 'PBA9090909',
                    dateCreated: '2024-03-01T00:00:00.000Z'
                  }
                ]
              }
            ]
          },
          onlyWhenSearchTermPresent: true
        }
      });

      await test.step('Open new PBAs tab', async () => {
        await organisationApprovalsPage.openNewPbasTab();
        await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
      });

      await test.step('Search pending PBAs with incomplete response', async () => {
        const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
        await pendingPbaResponse;
        expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase());
      });

      await test.step('Verify pending PBA empty state is shown', async () => {
        await expect(organisationApprovalsPage.pendingPbaEmptyState).toBeVisible();
      });
    });
  }
);

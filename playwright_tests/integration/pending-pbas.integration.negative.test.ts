import { test, expect } from '../page-objects/page.fixtures';
import { setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  createMockPendingPbaOrganisation,
  waitForPendingPbaStatusResponse,
  waitForPendingPbaStatusResponseWithHttpStatus,
  waitForSingleOrganisationResponseWithHttpStatus
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  organisationDetailsStatusCodeScenarios,
  pendingPbaStatusCodeScenarios
} from './test-data/organisation-search.data';

const ERROR_PAGE_BODY = 'Try again later.';
const DETAILS_ERROR_ROUTE_TIMEOUT_MS = 5000;
const PENDING_PBA_DETAILS_ORGANISATION_ID = 'PBA-DETAILS-NEGATIVE-001';
const PENDING_PBA_DETAILS_ORGANISATION = createMockPendingPbaOrganisation({
  organisationIdentifier: PENDING_PBA_DETAILS_ORGANISATION_ID,
  organisationName: 'Pending PBA details negative org',
  pbaNumbers: [{ pbaNumber: 'PBA9090909', dateCreated: '2024-03-01T00:00:00.000Z' }]
});
const PENDING_PBA_DETAILS_SINGLE_ORGANISATION = createMockOrganisation({
  organisationIdentifier: PENDING_PBA_DETAILS_ORGANISATION_ID,
  name: PENDING_PBA_DETAILS_ORGANISATION.organisationName,
  status: 'ACTIVE',
  paymentAccount: [],
  pendingPaymentAccount: ['PBA9090909']
});

test.describe(
  'Playwright integration: pending PBAs search negative paths',
  { tag: ['@integration', '@organisations', '@search-negative'] },
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
          expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(ORGANISATION_SEARCH_TERMS.pendingPbaByName.toLowerCase());
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

test.describe(
  'Playwright integration: pending PBA details negative paths',
  { tag: ['@integration', '@organisations', '@negative'] },
  () => {
    test.skip(true, 'EXUI-4809: details API errors from View links are not routed to error pages');

    for (const scenario of organisationDetailsStatusCodeScenarios) {
      test(`Pending PBA View link handles details API status ${scenario.statusCode}`, async ({
        page,
        errorPage,
        organisationApprovalsPage
      }) => {
        const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
          pendingPbaOrganisations: [PENDING_PBA_DETAILS_ORGANISATION],
          organisations: {
            singleOrganisationsById: {
              [PENDING_PBA_DETAILS_ORGANISATION_ID]: PENDING_PBA_DETAILS_SINGLE_ORGANISATION
            },
            singleOrganisationResponse: {
              status: scenario.statusCode,
              body: { message: `mock pending pba details error ${scenario.statusCode}` }
            }
          }
        });

        await test.step('Open pending PBA details from View link', async () => {
          await organisationApprovalsPage.openNewPbasTab();
          await expect(organisationApprovalsPage.pendingPbaRowByText(PENDING_PBA_DETAILS_ORGANISATION.organisationName)).toBeVisible();
          const detailsResponse = waitForSingleOrganisationResponseWithHttpStatus(
            page,
            PENDING_PBA_DETAILS_ORGANISATION_ID,
            scenario.statusCode
          );
          await organisationApprovalsPage.openFirstPendingPba();
          await detailsResponse;
          expect(standardApiMocks.getLastSingleOrganisationId()).toEqual(PENDING_PBA_DETAILS_ORGANISATION_ID);
        });

        await test.step('Verify pending PBA details error route', async () => {
          await expect(page).toHaveURL(scenario.expectedRedirectPath, { timeout: DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.heading).toBeVisible({ timeout: DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading, { timeout: DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.body).toBeVisible({ timeout: DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY, { timeout: DETAILS_ERROR_ROUTE_TIMEOUT_MS });
        });
      });
    }
  }
);

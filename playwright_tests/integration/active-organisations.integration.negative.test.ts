import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import { clearOrganisationSearchSession, setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  waitForOrganisationStatusResponse,
  waitForOrganisationStatusResponseWithHttpStatus,
  waitForSingleOrganisationResponseWithHttpStatus,
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  activeOrganisationLoadStatusCodeScenarios,
  activeOrganisationStatusCodeScenarios,
  organisationDetailsStatusCodeScenarios,
} from './test-data/organisation-search.data';

const ERROR_PAGE_BODY = 'Try again later.';
const ACTIVE_ORGANISATIONS_URL = new URL('/organisation/active', config.baseUrl).toString();
const ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS = 5000;
const ACTIVE_DETAILS_ORGANISATION = createMockOrganisation({
  organisationIdentifier: 'ACTIVE-DETAILS-NEGATIVE-001',
  name: 'Active details negative org',
  status: 'ACTIVE',
  paymentAccount: ['PBA2222222'],
  pendingPaymentAccount: [],
});

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

test.describe('Playwright integration: active organisations load negative paths', { tag: ['@active-orgs', '@negative'] }, () => {
  for (const scenario of activeOrganisationLoadStatusCodeScenarios) {
    test(`Active organisations load handles HTTP ${scenario.statusCode}`, async ({
      page,
      errorPage,
      organisationApprovalsPage,
    }) => {
      const organisationApiMock = await setupCommonOrganisationApiMocks(page, {
        activeSearchResponse: {
          status: scenario.statusCode,
          body: {
            error: 'Active organisations search failed',
            errorDescription: `Unable to retrieve active organisations for status ${scenario.statusCode}`,
            status: scenario.statusCode,
            timestamp: '2024-05-21T10:00:00.000Z',
          },
        },
      });

      await test.step('Open approvals page', async () => {
        await clearOrganisationSearchSession(page);
        await ensureAuthenticatedPage(page, 'base');
        await expect(organisationApprovalsPage.heading).toBeVisible();
        await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
      });

      await test.step(`Open active organisations route with HTTP ${scenario.statusCode} mock`, async () => {
        const activeOrganisationsResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', scenario.statusCode);
        await page.goto(ACTIVE_ORGANISATIONS_URL);
        await activeOrganisationsResponse;
      });

      await test.step('Verify active organisations request and error route', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
        expect(organisationApiMock.getLastActiveSearchPayload()).toEqual(ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD);
        await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading);
        await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY);
      });
    });
  }
});

test.describe(
  'Playwright integration: active organisation details negative paths',
  { tag: ['@active-orgs', '@details', '@negative'] },
  () => {
    test.skip(true, 'EXUI-4809: details API errors from View links are not routed to error pages');

    for (const scenario of organisationDetailsStatusCodeScenarios) {
      test(`Active organisation View link handles details API status ${scenario.statusCode}`, async ({
        page,
        errorPage,
        organisationApprovalsPage,
      }) => {
        const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
          organisations: {
            activeOrganisations: [ACTIVE_DETAILS_ORGANISATION],
            singleOrganisationsById: {
              [ACTIVE_DETAILS_ORGANISATION.organisationIdentifier]: ACTIVE_DETAILS_ORGANISATION,
            },
            singleOrganisationResponse: {
              status: scenario.statusCode,
              body: { message: `mock active details error ${scenario.statusCode}` },
            },
          },
        });

        await test.step('Open active organisation details from View link', async () => {
          await organisationApprovalsPage.openActiveOrganisationsTab();
          await expect(organisationApprovalsPage.activeOrganisationRowByText(ACTIVE_DETAILS_ORGANISATION.name)).toBeVisible();
          const detailsResponse = waitForSingleOrganisationResponseWithHttpStatus(
            page,
            ACTIVE_DETAILS_ORGANISATION.organisationIdentifier,
            scenario.statusCode
          );
          await organisationApprovalsPage.openFirstActiveOrganisation();
          await detailsResponse;
          expect(standardApiMocks.getLastSingleOrganisationId()).toEqual(ACTIVE_DETAILS_ORGANISATION.organisationIdentifier);
        });

        await test.step('Verify active details error route', async () => {
          await expect(page).toHaveURL(scenario.expectedRedirectPath, { timeout: ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.heading).toBeVisible({ timeout: ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading, {
            timeout: ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS,
          });
          await expect(errorPage.body).toBeVisible({ timeout: ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS });
          await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY, { timeout: ACTIVE_DETAILS_ERROR_ROUTE_TIMEOUT_MS });
        });
      });
    }
  }
);

test.describe(
  'Playwright integration: active organisations search negative paths',
  { tag: ['@active-orgs', '@search-negative'] },
  () => {
    for (const scenario of activeOrganisationStatusCodeScenarios) {
      test(`Active organisation search handles HTTP ${scenario.statusCode}`, async ({
        page,
        errorPage,
        organisationApprovalsPage,
      }) => {
        const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
          organisations: {
            activeSearchResponse: {
              status: scenario.statusCode,
              body: { message: `mock active search error ${scenario.statusCode}` },
              onlyWhenSearchTermPresent: true,
            },
          },
        });

        await test.step('Open active organisations tab', async () => {
          await clearOrganisationSearchSession(page);
          const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
          await page.goto(ACTIVE_ORGANISATIONS_URL);
          await activeOrganisationsResponse;
          await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
        });

        await test.step(`Search active organisations with HTTP ${scenario.statusCode} mock`, async () => {
          const activeOrganisationsResponse = waitForOrganisationStatusResponseWithHttpStatus(
            page,
            'ACTIVE',
            scenario.statusCode
          );
          await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
          await activeOrganisationsResponse;
          expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.search_filter).toEqual(
            ORGANISATION_SEARCH_TERMS.activeByName
          );
        });

        await test.step('Verify active search shows expected error page', async () => {
          await expect(page).toHaveURL(scenario.expectedRedirectPath);
          await expect(errorPage.heading).toBeVisible();
          await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading);
          await expect(errorPage.body).toBeVisible();
          await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY);
        });
      });
    }

    test('Active organisation search with incomplete response object still renders returned row', async ({
      page,
      organisationApprovalsPage,
    }) => {
      const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeSearchResponse: {
            status: 200,
            body: {
              organisations: [
                {
                  organisationIdentifier: 'INCOMPLETEACTIVE001',
                  name: 'Incomplete Active Org',
                  status: 'ACTIVE',
                  paymentAccount: [],
                  pendingPaymentAccount: [],
                },
              ],
            },
            onlyWhenSearchTermPresent: true,
          },
        },
      });

      await test.step('Open active organisations tab', async () => {
        await clearOrganisationSearchSession(page);
        const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
        await page.goto(ACTIVE_ORGANISATIONS_URL);
        await activeOrganisationsResponse;
        await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      });

      await test.step('Search active organisations with incomplete response', async () => {
        const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
        await activeOrganisationsResponse;
        expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.search_filter).toEqual(
          ORGANISATION_SEARCH_TERMS.activeByName
        );
      });

      await test.step('Verify incomplete active organisation row is shown', async () => {
        await expect(organisationApprovalsPage.activeOrganisationRowByText('Incomplete Active Org')).toBeVisible();
      });
    });
  }
);

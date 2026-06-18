import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  pendingOrganisationDecisionPayloadFromMockData,
  setupOrganisationSearchIntegrationPage,
} from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock,
} from './mocks';
import { ORGANISATION_SEARCH_TERMS, pendingOrganisationStatusCodeScenarios } from './test-data/organisation-search.data';

const ERROR_PAGE_BODY = 'Try again later.';
const PENDING_ORGANISATION_DECISION_API_ERROR_STATUSES = [400, 403, 404, 500];
const PENDING_ORGANISATION_ID = 'PENDING-APPROVE-NEGATIVE-001';
const PENDING_ORGANISATION_NAME = 'Pending approve negative org';

test.describe(
  'Playwright integration: pending organisations search negative paths',
  { tag: ['@integration', '@organisations', '@search-negative'] },
  () => {
    for (const scenario of pendingOrganisationStatusCodeScenarios) {
      test(`Pending organisation search handles HTTP ${scenario.statusCode}`, async ({
        page,
        errorPage,
        organisationApprovalsPage,
      }) => {
        await setupOrganisationSearchIntegrationPage(page, {
          organisations: {
            pendingSearchResponse: {
              status: scenario.statusCode,
              body: { message: `mock pending search error ${scenario.statusCode}` },
              onlyWhenSearchTermPresent: true,
            },
          },
        });

        await test.step(`Search pending organisations with HTTP ${scenario.statusCode} mock`, async () => {
          await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
        });

        await test.step('Verify pending search shows expected error page', async () => {
          await expect(page).toHaveURL(scenario.expectedRedirectPath);
          await expect(errorPage.heading).toBeVisible();
          await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading);
          await expect(errorPage.body).toBeVisible();
          await expect(errorPage.body).toHaveText(ERROR_PAGE_BODY);
        });
      });
    }

    test('Pending organisation search with incomplete response object shows fallback empty-state', async ({
      page,
      organisationApprovalsPage,
    }) => {
      await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          pendingSearchResponse: {
            status: 200,
            body: {
              organisations: [
                {
                  organisationIdentifier: 'INCOMPLETE001',
                  name: 'Incomplete Pending Org',
                  status: 'PENDING',
                  paymentAccount: [],
                  pendingPaymentAccount: [],
                },
              ],
            },
            onlyWhenSearchTermPresent: true,
          },
        },
      });

      await test.step('Search pending organisations with incomplete response', async () => {
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      });

      await test.step('Verify pending empty state is shown', async () => {
        await expect(organisationApprovalsPage.pendingOrganisationEmptyState).toBeVisible();
      });
    });
  }
);

test.describe(
  'Playwright integration: pending organisation decision negative paths',
  { tag: ['@integration', '@organisations', '@pending-decisions', '@negative'] },
  () => {
    for (const apiStatusCode of PENDING_ORGANISATION_DECISION_API_ERROR_STATUSES) {
      test(`Pending registration approval handles API status ${apiStatusCode}`, async ({ page, organisationApprovalsPage }) => {
        let decisionApiMock: { getLastMethod: any; getLastPayload: any };
        const mockedPendingOrganisation = createMockOrganisation({
          organisationIdentifier: PENDING_ORGANISATION_ID,
          name: PENDING_ORGANISATION_NAME,
          status: 'PENDING',
          paymentAccount: [],
          pendingPaymentAccount: ['PBA1111111'],
        });

        await test.step('Setup mocked pending organisation APIs', async () => {
          await setupCommonOrganisationApiMocks(page, {
            pendingOrganisations: [mockedPendingOrganisation],
            singleOrganisationsById: {
              [PENDING_ORGANISATION_ID]: mockedPendingOrganisation,
            },
          });
          await setupPbaAccountsApiMock(page, ['Mock Liberata Account']);
          await setupLovRefDataApiMock(page, []);
          decisionApiMock = await setupPendingOrganisationDecisionApiMock(page, {
            organisationId: PENDING_ORGANISATION_ID,
            status: apiStatusCode,
            responseBody: {
              apiError: `Mock pending organisation approval error ${apiStatusCode}`,
              apiStatusCode,
              message: 'handlePutOrganisationRoute error',
            },
          });
        });

        await test.step('Open pending organisation details', async () => {
          await ensureAuthenticatedPage(page, 'base');
          const organisationDetailsUrl = new URL(`/organisation-details/${PENDING_ORGANISATION_ID}`, config.baseUrl).toString();
          await page.goto(organisationDetailsUrl);
          await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
        });

        await test.step('Submit approve decision', async () => {
          await organisationApprovalsPage.chooseDecision('Approve it');
          await organisationApprovalsPage.submitDecision();
          await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();

          await organisationApprovalsPage.confirmDecision();
        });

        await test.step('Verify approval request and error outcome', async () => {
          expect(decisionApiMock?.getLastMethod()).toEqual('PUT');
          expect(decisionApiMock?.getLastPayload()).toEqual(
            pendingOrganisationDecisionPayloadFromMockData(mockedPendingOrganisation, 'ACTIVE')
          );
          await expect(page).toHaveURL(/\/approve-organisations/);
          await expect(organisationApprovalsPage.confirmDecisionErrorSummary).toBeVisible();
          await expect(organisationApprovalsPage.confirmDecisionErrorSummaryTitle).toHaveText(
            'Sorry, there is a problem with the service'
          );
        });
      });
    }
  }
);

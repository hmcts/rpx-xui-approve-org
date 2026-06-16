import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import {
  waitForOrganisationStatusResponseWithHttpStatus,
  waitForPendingPbaStatusResponseWithHttpStatus
} from './mocks';
import { setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  ORGANISATION_SEARCH_TERMS,
  activeOrganisationStatusCodeScenarios,
  pendingOrganisationStatusCodeScenarios,
  pendingPbaStatusCodeScenarios
} from './test-data/organisation-search.data';

test.describe('Playwright integration: organisation search negative paths', { tag: ['@integration', '@organisations', '@search-negative'] }, () => {
  for (const scenario of pendingOrganisationStatusCodeScenarios) {
    test(`Pending organisation search handles HTTP ${scenario.statusCode}`, async ({ page }) => {
      const {
        organisationApprovalsPage
      } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          pendingSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock pending search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      });

      const failedSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'PENDING,REVIEW', scenario.statusCode);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      await failedSearchResponse;

      await expect(page).toHaveURL(scenario.expectedRedirectPath);
    });
  }

  for (const scenario of pendingPbaStatusCodeScenarios) {
    test(`Pending PBA search handles HTTP ${scenario.statusCode}`, async ({ page }) => {
      const {
        organisationApprovalsPage
      } = await setupOrganisationSearchIntegrationPage(page, {
        pendingPbaSearchResponse: {
          status: scenario.statusCode,
          body: { message: `mock pending pba search error ${scenario.statusCode}` },
          onlyWhenSearchTermPresent: true
        }
      });

      const pendingPbaInitialResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
      await organisationApprovalsPage.openNewPbasTab();
      await pendingPbaInitialResponse;

      const failedSearchResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, scenario.statusCode);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
      await failedSearchResponse;

      await expect(page).toHaveURL(scenario.expectedRedirectPath);
    });
  }

  for (const scenario of activeOrganisationStatusCodeScenarios) {
    test(`Active organisation search handles HTTP ${scenario.statusCode}`, async ({ page }) => {
      const {
        organisationApprovalsPage
      } = await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock active search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      });

      const activeInitialResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await activeInitialResponse;

      const failedSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', scenario.statusCode);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
      await failedSearchResponse;

      await expect(page).toHaveURL(scenario.expectedRedirectPath);
    });
  }

  test('Pending organisation search with incomplete response object shows fallback empty-state', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingSearchResponse: {
          status: 200,
          body: {
            organisations: [{
              organisationIdentifier: 'INCOMPLETE001',
              name: 'Incomplete Pending Org',
              status: 'PENDING',
              paymentAccount: [],
              pendingPaymentAccount: []
            }]
          },
          onlyWhenSearchTermPresent: true
        }
      }
    });

    const pendingSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'PENDING,REVIEW', 200);
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    await pendingSearchResponse;

    await expect(page.getByText('There are no new registrations.')).toBeVisible();
  });

  test('Active organisation search with incomplete response object still renders returned row', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        activeSearchResponse: {
          status: 200,
          body: {
            organisations: [{
              organisationIdentifier: 'INCOMPLETEACTIVE001',
              name: 'Incomplete Active Org',
              status: 'ACTIVE',
              paymentAccount: [],
              pendingPaymentAccount: []
            }]
          },
          onlyWhenSearchTermPresent: true
        }
      }
    });

    const activeInitialResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeInitialResponse;

    const activeSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
    await activeSearchResponse;

    await expect(organisationApprovalsPage.activeOrganisationRowsByText('Incomplete Active Org').first()).toBeVisible();
  });

  test('Pending PBA search with incomplete response object shows fallback empty-state', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaSearchResponse: {
        status: 200,
        body: {
          organisations: [{
            organisationIdentifier: 'INCOMPLETEPBA001',
            organisationName: 'Incomplete PBA Org',
            superUser: {
              firstName: 'Incomplete',
              lastName: 'Admin',
              email: 'incomplete-pba-admin@example.com'
            },
            pbaNumbers: [{
              pbaNumber: 'PBA9090909',
              dateCreated: '2024-03-01T00:00:00.000Z'
            }]
          }]
        },
        onlyWhenSearchTermPresent: true
      }
    });

    const pendingPbaInitialResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
    await organisationApprovalsPage.openNewPbasTab();
    await pendingPbaInitialResponse;

    const pendingPbaSearchResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
    await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
    await pendingPbaSearchResponse;

    await expect(page.getByText('There are no new PBA requests.')).toBeVisible();
  });
});

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
      } = await test.step('Setup mocked pending organisation search failure', async () => setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          pendingSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock pending search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      }));

      await test.step(`Search pending organisations and wait for HTTP ${scenario.statusCode}`, async () => {
        const failedSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'PENDING,REVIEW', scenario.statusCode);
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
        await failedSearchResponse;
      });

      await test.step('Verify pending search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  for (const scenario of pendingPbaStatusCodeScenarios) {
    test(`Pending PBA search handles HTTP ${scenario.statusCode}`, async ({ page }) => {
      const {
        organisationApprovalsPage
      } = await test.step('Setup mocked pending PBA search failure', async () => setupOrganisationSearchIntegrationPage(page, {
        pendingPbaSearchResponse: {
          status: scenario.statusCode,
          body: { message: `mock pending pba search error ${scenario.statusCode}` },
          onlyWhenSearchTermPresent: true
        }
      }));

      await test.step('Open new PBAs tab', async () => {
        const pendingPbaInitialResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
        await organisationApprovalsPage.openNewPbasTab();
        await pendingPbaInitialResponse;
      });

      await test.step(`Search pending PBAs and wait for HTTP ${scenario.statusCode}`, async () => {
        const failedSearchResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, scenario.statusCode);
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
        await failedSearchResponse;
      });

      await test.step('Verify pending PBA search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  for (const scenario of activeOrganisationStatusCodeScenarios) {
    test(`Active organisation search handles HTTP ${scenario.statusCode}`, async ({ page }) => {
      const {
        organisationApprovalsPage
      } = await test.step('Setup mocked active organisation search failure', async () => setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock active search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      }));

      await test.step('Open active organisations tab', async () => {
        const activeInitialResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await activeInitialResponse;
      });

      await test.step(`Search active organisations and wait for HTTP ${scenario.statusCode}`, async () => {
        const failedSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', scenario.statusCode);
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
        await failedSearchResponse;
      });

      await test.step('Verify active search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  test('Pending organisation search with incomplete response object shows fallback empty-state', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await test.step('Setup incomplete pending organisation search response', async () => setupOrganisationSearchIntegrationPage(page, {
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
    }));

    await test.step('Search pending organisations with incomplete response', async () => {
      const pendingSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'PENDING,REVIEW', 200);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      await pendingSearchResponse;
    });

    await test.step('Verify pending empty state is shown', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationEmptyState).toBeVisible();
    });
  });

  test('Active organisation search with incomplete response object still renders returned row', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await test.step('Setup incomplete active organisation search response', async () => setupOrganisationSearchIntegrationPage(page, {
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
    }));

    await test.step('Open active organisations tab', async () => {
      const activeInitialResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await activeInitialResponse;
    });

    await test.step('Search active organisations with incomplete response', async () => {
      const activeSearchResponse = waitForOrganisationStatusResponseWithHttpStatus(page, 'ACTIVE', 200);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
      await activeSearchResponse;
    });

    await test.step('Verify incomplete active organisation row is shown', async () => {
      await expect(organisationApprovalsPage.activeOrganisationRowByText('Incomplete Active Org')).toBeVisible();
    });
  });

  test('Pending PBA search with incomplete response object shows fallback empty-state', async ({ page }) => {
    const {
      organisationApprovalsPage
    } = await test.step('Setup incomplete pending PBA search response', async () => setupOrganisationSearchIntegrationPage(page, {
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
    }));

    await test.step('Open new PBAs tab', async () => {
      const pendingPbaInitialResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
      await organisationApprovalsPage.openNewPbasTab();
      await pendingPbaInitialResponse;
    });

    await test.step('Search pending PBAs with incomplete response', async () => {
      const pendingPbaSearchResponse = waitForPendingPbaStatusResponseWithHttpStatus(page, 200);
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
      await pendingPbaSearchResponse;
    });

    await test.step('Verify pending PBA empty state is shown', async () => {
      await expect(organisationApprovalsPage.pendingPbaEmptyState).toBeVisible();
    });
  });
});

import { test, expect } from '../page-objects/page.fixtures';
import { setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  ORGANISATION_SEARCH_TERMS,
  activeOrganisationStatusCodeScenarios,
  pendingOrganisationStatusCodeScenarios,
  pendingPbaStatusCodeScenarios
} from './test-data/organisation-search.data';

test.describe('Playwright integration: organisation search negative paths', { tag: ['@integration', '@organisations', '@search-negative'] }, () => {
  for (const scenario of pendingOrganisationStatusCodeScenarios) {
    test(`Pending organisation search handles HTTP ${scenario.statusCode}`, async ({ page, organisationApprovalsPage }) => {
      await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          pendingSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock pending search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      });

      await test.step(`Search pending organisations with HTTP ${scenario.statusCode} mock`, async () => {
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      });

      await test.step('Verify pending search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  for (const scenario of pendingPbaStatusCodeScenarios) {
    test(`Pending PBA search handles HTTP ${scenario.statusCode}`, async ({ page, organisationApprovalsPage }) => {
      await setupOrganisationSearchIntegrationPage(page, {
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
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
      });

      await test.step('Verify pending PBA search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  for (const scenario of activeOrganisationStatusCodeScenarios) {
    test(`Active organisation search handles HTTP ${scenario.statusCode}`, async ({ page, organisationApprovalsPage }) => {
      await setupOrganisationSearchIntegrationPage(page, {
        organisations: {
          activeSearchResponse: {
            status: scenario.statusCode,
            body: { message: `mock active search error ${scenario.statusCode}` },
            onlyWhenSearchTermPresent: true
          }
        }
      });

      await test.step('Open active organisations tab', async () => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
        await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
      });

      await test.step(`Search active organisations with HTTP ${scenario.statusCode} mock`, async () => {
        await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
      });

      await test.step('Verify active search redirects to expected error page', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
      });
    });
  }

  test('Pending organisation search with incomplete response object shows fallback empty-state', async ({ page, organisationApprovalsPage }) => {
    await setupOrganisationSearchIntegrationPage(page, {
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

    await test.step('Search pending organisations with incomplete response', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    });

    await test.step('Verify pending empty state is shown', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationEmptyState).toBeVisible();
    });
  });

  test('Active organisation search with incomplete response object still renders returned row', async ({ page, organisationApprovalsPage }) => {
    await setupOrganisationSearchIntegrationPage(page, {
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

    await test.step('Open active organisations tab', async () => {
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    });

    await test.step('Search active organisations with incomplete response', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.activeByName);
    });

    await test.step('Verify incomplete active organisation row is shown', async () => {
      await expect(organisationApprovalsPage.activeOrganisationRowByText('Incomplete Active Org')).toBeVisible();
    });
  });

  test('Pending PBA search with incomplete response object shows fallback empty-state', async ({ page, organisationApprovalsPage }) => {
    await setupOrganisationSearchIntegrationPage(page, {
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

    await test.step('Open new PBAs tab', async () => {
      await organisationApprovalsPage.openNewPbasTab();
      await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    });

    await test.step('Search pending PBAs with incomplete response', async () => {
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPbaByName);
    });

    await test.step('Verify pending PBA empty state is shown', async () => {
      await expect(organisationApprovalsPage.pendingPbaEmptyState).toBeVisible();
    });
  });
});

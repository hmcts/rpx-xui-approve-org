import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  getPaginationSummaryPattern,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  buildPendingPaginationOrganisations,
  pendingNonMatchingOrganisation,
  pendingSearchMatchOrganisation
} from './test-data/organisation-search.data';
import { decisionScenarios } from './test-data/pending-decisions.data';

test.describe('Playwright integration: pending organisations search', { tag: ['@integration', '@organisations', '@search'] }, () => {
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
});

test.describe(
  'Playwright integration: pending decision matrix',
  { tag: ['@integration', '@organisations', '@pending-decisions'] },
  () => {
    for (const scenario of decisionScenarios) {
      test(`Pending registration decision: ${scenario.idSuffix}`, async ({ page, organisationApprovalsPage }) => {
        const organisationId = `PENDING-${scenario.idSuffix.toUpperCase()}-001`;
        let decisionApiMock: { getLastMethod: any; getLastPayload: any };

        await test.step('Setup mocked pending organisation APIs', async () => {
          const mockedPendingOrganisation = createMockOrganisation({
            organisationIdentifier: organisationId,
            name: `Pending ${scenario.idSuffix} org`,
            status: 'PENDING',
            paymentAccount: [],
            pendingPaymentAccount: ['PBA1111111']
          });

          await setupCommonOrganisationApiMocks(page, {
            pendingOrganisations: [mockedPendingOrganisation],
            singleOrganisationsById: {
              [organisationId]: mockedPendingOrganisation
            }
          });
          await setupPbaAccountsApiMock(page, ['Mock Liberata Account']);
          await setupLovRefDataApiMock(page, []);
          decisionApiMock = await setupPendingOrganisationDecisionApiMock(page, { organisationId });
        });

        await test.step('Open pending organisation details', async () => {
          await ensureAuthenticatedPage(page, 'base');
          const organisationDetailsUrl = new URL(`/organisation-details/${organisationId}`, config.baseUrl).toString();
          await page.goto(organisationDetailsUrl);
          await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
        });

        await test.step(`Submit ${scenario.idSuffix} decision`, async () => {
          await organisationApprovalsPage.chooseDecision(scenario.decisionLabel);
          await organisationApprovalsPage.submitDecision();
          await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();

          await organisationApprovalsPage.confirmDecision();
        });

        await test.step('Verify decision request and success banner', async () => {
          await expect(page).toHaveURL(/\/organisation\/pending/);
          await expect(organisationApprovalsPage.successBanner(scenario.successBannerText)).toBeVisible();
          expect(decisionApiMock?.getLastMethod()).toEqual(scenario.expectedMethod);
          if (scenario.expectedStatus) {
            expect(decisionApiMock?.getLastPayload()).toEqual({
              organisationIdentifier: organisationId,
              sraId: 'SRA12345',
              contactInformation: [
                {
                  addressLine1: '1 Mock Street',
                  addressLine2: 'Mock District',
                  townCity: 'London',
                  county: 'Greater London',
                  dxAddress: [{ dxNumber: 'DX 100', dxExchange: 'London' }]
                }
              ],
              superUser: {
                userIdentifier: 'Mock Admin',
                firstName: 'Mock Admin',
                lastName: 'Mock Admin',
                email: 'mock-admin@example.com'
              },
              status: scenario.expectedStatus,
              name: `Pending ${scenario.idSuffix} org`,
              paymentAccount: [],
              pendingPaymentAccount: ['PBA1111111'],
              orgAttributes: [],
              companyNumber: '12345678',
              orgType: 'SOLICITOR'
            });
          } else {
            expect(decisionApiMock?.getLastPayload()).toBeNull();
          }
        });
      });
    }
  }
);

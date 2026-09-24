import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  getPaginationSummaryPattern,
  organisationTableRowsFromMockData,
  pendingOrganisationDecisionPayloadFromMockData,
  setupOrganisationSearchIntegrationPage
} from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock,
  waitForOrganisationStatusResponse,
  waitForPendingPbaStatusResponse,
  waitForPendingOrganisationDecisionResponse
} from './mocks';
import {
  ORGANISATION_SEARCH_TERMS,
  buildActiveSearchOrganisations,
  buildPendingAddressSearchOrganisations,
  buildPendingPaginationOrganisations,
  buildPendingPbaSearchOrganisations,
  buildPendingSearchOrganisations
} from './test-data/organisation-search.data';
import { decisionScenarios } from './test-data/pending-decisions.data';

const PENDING_ORGANISATIONS = [
  createMockOrganisation({
    organisationIdentifier: 'PENDINGTABLE01',
    name: 'Pending Table Mock Org One',
    status: 'PENDING',
    contactInformation: [
      {
        addressLine1: '11 Pending Street',
        addressLine2: 'Registration Quarter',
        addressLine3: 'Suite 1',
        townCity: 'Cardiff',
        county: 'South Glamorgan',
        postCode: 'CF1 1AA',
        dxAddress: [{ dxNumber: 'DX 810', dxExchange: 'Cardiff' }]
      }
    ],
    superUser: {
      userIdentifier: 'pending-table-admin-one-id',
      firstName: 'Pending',
      lastName: 'Admin',
      email: 'pending.admin@example.com'
    },
    paymentAccount: [],
    pendingPaymentAccount: ['PBA8100001'],
    dateReceived: '2024-04-15T00:00:00.000Z'
  }),
  createMockOrganisation({
    organisationIdentifier: 'PENDINGTABLE02',
    name: 'Pending Table Mock Org Two',
    status: 'REVIEW',
    contactInformation: [
      {
        addressLine1: '22 Review Road',
        addressLine2: 'Registration Quarter',
        addressLine3: 'Suite 2',
        townCity: 'Liverpool',
        county: 'Merseyside',
        postCode: 'L1 1AA',
        dxAddress: [{ dxNumber: 'DX 811', dxExchange: 'Liverpool' }]
      }
    ],
    superUser: {
      userIdentifier: 'pending-table-admin-two-id',
      firstName: 'Review',
      lastName: 'Admin',
      email: 'review.admin@example.com'
    },
    paymentAccount: [],
    pendingPaymentAccount: ['PBA8100002'],
    dateReceived: '2024-04-16T00:00:00.000Z'
  })
];

test.describe('Playwright integration: pending organisations', { tag: ['@pending-orgs', '@positive'] }, () => {
  test('New registrations tab renders mocked pending organisations', async ({ page, organisationApprovalsPage }) => {
    const { pendingOrganisations } = await setupCommonOrganisationApiMocks(page, {
      pendingOrganisations: PENDING_ORGANISATIONS
    });

    await ensureAuthenticatedPage(page, 'base');
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await expect(organisationApprovalsPage.tabPanel).toBeVisible();
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
    await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
    await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
    expect(await organisationApprovalsPage.pendingOrganisationTableRows()).toEqual(
      organisationTableRowsFromMockData(pendingOrganisations)
    );
  });
});

test.describe('Playwright integration: pending organisations search', { tag: ['@pending-orgs', '@search', '@positive'] }, () => {
  test('Search waits for the initial pending results before entering a new term', async ({ page, organisationApprovalsPage }) => {
    let releaseInitialPendingResponse: (() => void) | undefined;
    const initialPendingResponse = new Promise<void>((resolve) => {
      releaseInitialPendingResponse = resolve;
    });
    let initialPendingRequestSeen: (() => void) | undefined;
    const initialPendingRequest = new Promise<void>((resolve) => {
      initialPendingRequestSeen = resolve;
    });

    await setupOrganisationSearchIntegrationPage(page, {}, {
      beforeNavigate: async () => {
        await page.route('**/api/organisations?**', async (route, request) => {
          const requestUrl = new URL(request.url());
          const isInitialPendingRequest = request.method() === 'POST'
            && requestUrl.searchParams.get('status') === 'PENDING,REVIEW'
            && !request.postDataJSON()?.searchRequest?.search_filter;

          if (isInitialPendingRequest) {
            initialPendingRequestSeen?.();
            await initialPendingResponse;
          }

          await route.fallback();
        });
      }
    });

    await initialPendingRequest;
    await expect(page.locator('xuilib-loading-spinner .spinner-container')).toBeVisible();
    await page.locator('#search').evaluate((input) => {
      const pageWindow = window as unknown as { searchInputEvents: string[] };
      pageWindow.searchInputEvents = [];
      input.addEventListener('input', () => pageWindow.searchInputEvents.push('input'));
    });

    const searchPromise = organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(await page.evaluate(() => (window as unknown as { searchInputEvents: string[] }).searchInputEvents)).toEqual([]);

    releaseInitialPendingResponse?.();
    await searchPromise;
    expect(await page.evaluate(() => (window as unknown as { searchInputEvents: string[] }).searchInputEvents)).toEqual(['input']);
  });

  test('Search does not enter a term while a visible spinner overlays already-rendered results', async ({ page, organisationApprovalsPage }) => {
    await setupOrganisationSearchIntegrationPage(page);
    await expect(organisationApprovalsPage.pendingOrganisationDataRows.first()).toBeVisible();

    await page.locator('#search').evaluate((input) => {
      const pageWindow = window as unknown as { searchInputEvents: string[] };
      pageWindow.searchInputEvents = [];
      input.addEventListener('input', () => pageWindow.searchInputEvents.push('input'));

      const spinner = document.createElement('xuilib-loading-spinner');
      spinner.setAttribute('data-testid', 'delayed-search-spinner');
      spinner.style.cssText = 'display:block;position:fixed;width:1px;height:1px;z-index:9999';
      spinner.innerHTML = '<div class="spinner-container" style="display:block;width:1px;height:1px"></div>';
      document.body.appendChild(spinner);
    });

    const searchPromise = organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
    await expect.poll(
      () => page.evaluate(() => (window as unknown as { searchInputEvents: string[] }).searchInputEvents),
      { timeout: 1_000 }
    ).toEqual([]);

    await page.getByTestId('delayed-search-spinner').evaluate((spinner) => spinner.remove());
    await searchPromise;

    expect(await page.evaluate(() => (window as unknown as { searchInputEvents: string[] }).searchInputEvents)).toEqual(['input']);
  });

  test('Search by organisation in new registrations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const pendingSearchOrganisations = buildPendingSearchOrganisations(10);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingSearchOrganisations
      }
    });

    await test.step('Search pending organisations by name and verify request', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest?.search_filter).toEqual(
        ORGANISATION_SEARCH_TERMS.pendingByName
      );
    });

    await test.step('Verify pending organisation search results', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationDataRows).toHaveCount(pendingSearchOrganisations.length);
      const pendingOrganisationRows = await organisationApprovalsPage.pendingOrganisationTableRows(pendingSearchOrganisations.length);
      expect(pendingOrganisationRows).toEqual(organisationTableRowsFromMockData(pendingSearchOrganisations));
      expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toEqual(
        ORGANISATION_SEARCH_TERMS.pendingByName.toLowerCase()
      );
    });

    await test.step('Verify pagination is not shown for 10 pending organisations', async () => {
      expect(await organisationApprovalsPage.pendingOrganisationTableRows(10)).toHaveLength(10);
      await expect(organisationApprovalsPage.pagination).toHaveCount(0);
    });
  });

  test('Search by address in new registrations uses mocked search API', async ({ page, organisationApprovalsPage }) => {
    const pendingAddressSearchOrganisations = buildPendingAddressSearchOrganisations(10);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingAddressSearchOrganisations
      }
    });

    await test.step('Search pending organisations by address and verify request', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByAddress);
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest?.search_filter).toEqual(
        ORGANISATION_SEARCH_TERMS.pendingByAddress
      );
    });

    await test.step('Verify pending organisation address search results', async () => {
      const pendingOrganisationRows = await organisationApprovalsPage.pendingOrganisationTableRows(10);
      await expect(organisationApprovalsPage.pendingOrganisationDataRows).toHaveCount(pendingAddressSearchOrganisations.length);
      expect(pendingOrganisationRows).toEqual(organisationTableRowsFromMockData(pendingAddressSearchOrganisations));
      expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toEqual(
        ORGANISATION_SEARCH_TERMS.pendingByAddress.toLowerCase()
      );
    });

    await test.step('Verify pagination is not shown for 10 pending organisations', async () => {
      expect(await organisationApprovalsPage.pendingOrganisationTableRows(10)).toHaveLength(10);
      await expect(organisationApprovalsPage.pagination).toHaveCount(0);
    });
  });

  test('Search by organisation in new registrations shows empty state for empty 200 response', async ({
    page,
    organisationApprovalsPage
  }) => {
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: []
      }
    });

    await test.step('Search pending organisations and verify empty response request', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingByName);
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest).toMatchObject({
        search_filter: ORGANISATION_SEARCH_TERMS.pendingByName,
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
    });

    await test.step('Verify pending organisations empty response state', async () => {
      await expect(organisationApprovalsPage.pendingOrganisationEmptyState).toBeVisible();
      expect(await organisationApprovalsPage.pendingOrganisationTableRows()).toEqual([]);
      await expect(organisationApprovalsPage.pagination).toHaveCount(0);
    });
  });

  test('Pagination in new registrations keeps search term and requests page 2', async ({ page, organisationApprovalsPage }) => {
    const pendingPaginationOrganisations = buildPendingPaginationOrganisations(11);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingPaginationOrganisations
      }
    });

    await test.step('Search pending organisations and verify first-page request', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPagination);
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest).toMatchObject({
        search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination,
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
      expect(await organisationApprovalsPage.pendingOrganisationTableRows(10)).toEqual(
        organisationTableRowsFromMockData(pendingPaginationOrganisations.slice(0, 10))
      );
      await expect(organisationApprovalsPage.pagination).toContainText(
        getPaginationSummaryPattern(1, 10, pendingPaginationOrganisations.length)
      );
    });

    await test.step('Open pending organisation page 2 and verify request', async () => {
      const expectedSecondPageOrganisation = pendingPaginationOrganisations[10];
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.openPaginationPage(2);
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest).toMatchObject({
        search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination,
        pagination_parameters: {
          page_number: 2,
          page_size: 10
        }
      });
      await expect(organisationApprovalsPage.searchInput).toHaveValue(ORGANISATION_SEARCH_TERMS.pendingPagination);
      expect(await organisationApprovalsPage.pendingOrganisationTableRows(1)).toEqual(
        organisationTableRowsFromMockData([expectedSecondPageOrganisation])
      );
      await expect(organisationApprovalsPage.pagination).toContainText(
        getPaginationSummaryPattern(11, 11, pendingPaginationOrganisations.length)
      );
    });
  });

  test('Switching tabs sends tab-specific requests and resets pagination to page 1', async ({
    page,
    organisationApprovalsPage
  }) => {
    const pendingPaginationOrganisations = buildPendingPaginationOrganisations(11);
    const { standardApiMocks } = await setupOrganisationSearchIntegrationPage(page, {
      organisations: {
        pendingOrganisations: pendingPaginationOrganisations,
        activeOrganisations: buildActiveSearchOrganisations(10)
      },
      pendingPbaOrganisations: buildPendingPbaSearchOrganisations(10)
    });

    await test.step('Search pending organisations and move to page 2', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.searchForOrganisation(ORGANISATION_SEARCH_TERMS.pendingPagination);
      await pendingOrganisationsResponse;

      const pendingOrganisationsPageTwoResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.openPaginationPage(2);
      await pendingOrganisationsPageTwoResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()).toMatchObject({
        view: 'NEW',
        searchRequest: {
          search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination,
          pagination_parameters: {
            page_number: 2,
            page_size: 10
          }
        }
      });
    });

    await test.step('Switch to active organisations and verify isolated active request', async () => {
      const activeOrganisationsResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
      await organisationApprovalsPage.openActiveOrganisationsTab();
      await activeOrganisationsResponse;
      expect(standardApiMocks.getLastActiveOrganisationSearchPayload()).toMatchObject({
        view: 'ACTIVE',
        searchRequest: {
          search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination,
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      });
    });

    await test.step('Switch to new PBAs and verify isolated PBA request', async () => {
      const pendingPbaResponse = waitForPendingPbaStatusResponse(page);
      await organisationApprovalsPage.openNewPbasTab();
      await pendingPbaResponse;
      expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest).toMatchObject({
        drill_down_search: [
          {
            field_name: 'pbaPendings',
            search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination
          }
        ],
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      });
    });

    await test.step('Switch back to pending organisations and verify pagination is reset', async () => {
      const pendingOrganisationsResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');
      await organisationApprovalsPage.openPendingOrganisationsTab();
      await pendingOrganisationsResponse;
      expect(standardApiMocks.getLastPendingOrganisationSearchPayload()).toMatchObject({
        view: 'NEW',
        searchRequest: {
          search_filter: ORGANISATION_SEARCH_TERMS.pendingPagination,
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      });
    });
  });
});

test.describe('Playwright integration: pending decision matrix', { tag: ['@pending-decisions', '@positive'] }, () => {
  for (const scenario of decisionScenarios) {
    test(`Pending registration decision: ${scenario.idSuffix}`, async ({ page, organisationApprovalsPage }) => {
      const organisationId = `PENDING-${scenario.idSuffix.toUpperCase()}-001`;
      const mockedPendingOrganisation = createMockOrganisation({
        organisationIdentifier: organisationId,
        name: `Pending ${scenario.idSuffix} org`,
        status: 'PENDING',
        paymentAccount: [],
        pendingPaymentAccount: ['PBA1111111']
      });
      let decisionApiMock: { getLastMethod: any; getLastPayload: any };

      await test.step('Setup mocked pending organisation APIs', async () => {
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

        const decisionResponse = waitForPendingOrganisationDecisionResponse(page, organisationId);
        await organisationApprovalsPage.confirmDecision();
        await decisionResponse;
      });

      await test.step('Verify decision request and success banner', async () => {
        await expect(page).toHaveURL(/\/organisation\/pending/);
        await expect(organisationApprovalsPage.successBanner(scenario.successBannerText)).toBeVisible();
        expect(decisionApiMock?.getLastMethod()).toEqual(scenario.expectedMethod);
        if (scenario.expectedStatus) {
          expect(decisionApiMock?.getLastPayload()).toEqual(
            pendingOrganisationDecisionPayloadFromMockData(mockedPendingOrganisation, scenario.expectedStatus)
          );
        } else {
          expect(decisionApiMock?.getLastPayload()).toBeNull();
        }
      });
    });
  }
});

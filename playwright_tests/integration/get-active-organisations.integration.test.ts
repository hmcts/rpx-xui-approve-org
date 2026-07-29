import type { Page } from '@playwright/test';
import { test, expect } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { OrganisationApprovalsPage } from '../page-objects/pages';
import {
  ACTIVE_ORGANISATIONS_TABLE_SELECTOR,
  PENDING_ORGANISATIONS_TABLE_SELECTOR,
  setupCommonOrganisationApiMocks,
  waitForOrganisationNameInTable,
  waitForOrganisationStatusResponse
} from './mocks';

async function expectOrganisationApprovalsUi(page: Page): Promise<OrganisationApprovalsPage> {
  await ensureAuthenticatedPage(page, 'base');
  const organisationApprovalsPage = new OrganisationApprovalsPage(page);
  await expect(organisationApprovalsPage.heading).toBeVisible();
  await expect(organisationApprovalsPage.tabPanel).toBeVisible();
  await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();
  await expect(organisationApprovalsPage.newPbasTab).toBeVisible();
  await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();

  return organisationApprovalsPage;
}

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page }) => {
    const { pendingOrganisations, activeOrganisations } = await setupCommonOrganisationApiMocks(page);
    const pendingResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');

    const organisationApprovalsPage = await expectOrganisationApprovalsUi(page);
    await pendingResponse;
    await waitForOrganisationNameInTable(page, PENDING_ORGANISATIONS_TABLE_SELECTOR, pendingOrganisations[0].name);

    const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeResponse;
    await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();
    await waitForOrganisationNameInTable(page, ACTIVE_ORGANISATIONS_TABLE_SELECTOR, activeOrganisations[0].name);
  });

  test('Active organisations search submits long organisation-name search as a paged active search', async ({ page }) => {
    const longOrganisationName = '001fcFuzqHZCE6UptKv3 EsqkclX1AU9OTRJxsGSA';
    const { activeOrganisations } = await setupCommonOrganisationApiMocks(page, {
      activeOrganisations: [{
        organisationIdentifier: 'ACTIVELONG01',
        name: longOrganisationName,
        status: 'ACTIVE',
        companyNumber: '12345678',
        orgType: 'SOLICITOR',
        sraId: 'SRA12345',
        contactInformation: [{
          addressLine1: '1 Search Street',
          addressLine2: 'Search District',
          addressLine3: 'Search Area',
          townCity: 'London',
          county: 'Greater London',
          postCode: 'EC1A 1BB',
          dxAddress: [{ dxNumber: 'DX 100', dxExchange: 'London' }]
        }],
        superUser: {
          userIdentifier: 'long-search-admin',
          firstName: 'Search',
          lastName: 'Admin',
          email: 'long-search-admin@example.com'
        },
        paymentAccount: ['PBA2222222'],
        pendingPaymentAccount: [],
        orgAttributes: []
      }]
    });

    const organisationApprovalsPage = await expectOrganisationApprovalsUi(page);
    const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeResponse;

    const searchResponse = page.waitForResponse((response) => {
      const request = response.request();
      if (request.method().toUpperCase() !== 'POST') {
        return false;
      }

      const requestUrl = new URL(request.url());
      return requestUrl.pathname === '/api/organisations' &&
        requestUrl.searchParams.get('status') === 'ACTIVE' &&
        response.status() === 200;
    });

    await organisationApprovalsPage.searchForOrganisation(longOrganisationName);
    const response = await searchResponse;
    const searchRequest = response.request().postDataJSON() as {
      searchRequest?: {
        search_filter?: string;
        pagination_parameters?: {
          page_number?: number;
          page_size?: number;
        };
      };
    };

    expect(searchRequest.searchRequest?.search_filter).toBe(longOrganisationName);
    expect(searchRequest.searchRequest?.pagination_parameters).toEqual({
      page_number: 1,
      page_size: 10
    });
    await waitForOrganisationNameInTable(page, ACTIVE_ORGANISATIONS_TABLE_SELECTOR, activeOrganisations[0].name);
  });
});

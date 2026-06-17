import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { setupCommonOrganisationApiMocks } from './mocks';

const ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD = {
  view: 'ACTIVE',
  searchRequest: {
    search_filter: '',
    sorting_parameters: [{
      sort_by: 'organisationId',
      sort_order: 'asc'
    }],
    pagination_parameters: {
      page_number: 1,
      page_size: 10
    }
  }
};

const ACTIVE_ORGANISATIONS_LOAD_ERROR_SCENARIOS = [
  {
    statusCode: 400,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, there is a problem with the service'
  },
  {
    statusCode: 401,
    expectedRedirectPath: /\/not-authorised(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, you\'re not authorised to perform this action'
  },
  {
    statusCode: 403,
    expectedRedirectPath: /\/not-authorised(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, you\'re not authorised to perform this action'
  },
  {
    statusCode: 404,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, there is a problem with the service'
  },
  {
    statusCode: 500,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, there is a problem with the service'
  },
  {
    statusCode: 503,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: 'Sorry, there is a problem with the service'
  }
];

test.describe('Playwright integration: get active organisations negative paths', { tag: ['@integration', '@organisations', '@negative'] }, () => {
  for (const scenario of ACTIVE_ORGANISATIONS_LOAD_ERROR_SCENARIOS) {
    test(`Active organisations load handles HTTP ${scenario.statusCode}`, async ({ page, errorPage, organisationApprovalsPage }) => {
      const organisationApiMock = await setupCommonOrganisationApiMocks(page, {
        activeSearchResponse: {
          status: scenario.statusCode,
          body: {
            error: 'Active organisations search failed',
            errorDescription: `Unable to retrieve active organisations for status ${scenario.statusCode}`,
            status: scenario.statusCode,
            timestamp: '2024-05-21T10:00:00.000Z'
          }
        }
      });

      await test.step('Open approvals page', async () => {
        await ensureAuthenticatedPage(page, 'base');
        await expect(organisationApprovalsPage.heading).toBeVisible();
        await expect(organisationApprovalsPage.activeOrganisationsTab).toBeVisible();
      });

      await test.step(`Open active organisations tab with HTTP ${scenario.statusCode} mock`, async () => {
        await organisationApprovalsPage.openActiveOrganisationsTab();
      });

      await test.step('Verify active organisations request and error route', async () => {
        await expect(page).toHaveURL(scenario.expectedRedirectPath);
        expect(organisationApiMock.getLastActiveSearchPayload()).toEqual(ACTIVE_ORGANISATIONS_SEARCH_PAYLOAD);
        await expect(errorPage.heading).toHaveText(scenario.expectedErrorHeading);
        await expect(errorPage.body).toHaveText('Try again later.');
      });
    });
  }
});

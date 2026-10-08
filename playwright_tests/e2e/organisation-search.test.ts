import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

const NEW_REGISTRATION_ORG_SEARCH = 'Test';
const NEW_REGISTRATION_ADDRESS_SEARCH = 'SE15TY';
const NEW_PBA_ORG_SEARCH = 'test';
const ACTIVE_ORG_SEARCH = 'Test';
const ACTIVE_SEARCH_RESPONSE_TIMEOUT = 40_000;

test.describe('Organisation approvals search', { tag: ['@e2e', '@organisations', '@search'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test('Search by organisation in new registrations', { tag: '@refdata-search' }, async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisationWithTransientRecovery(NEW_REGISTRATION_ORG_SEARCH);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(NEW_REGISTRATION_ORG_SEARCH).first()).toBeVisible();
  });

  test('Search by address in new registrations', { tag: '@refdata-search' }, async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisationWithTransientRecovery(NEW_REGISTRATION_ADDRESS_SEARCH);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(NEW_REGISTRATION_ADDRESS_SEARCH).first()).toBeVisible();
  });

  test('Search by organisation in new PBAs', async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.openNewPbasTab();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisation(NEW_PBA_ORG_SEARCH);
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);

    await expect(organisationApprovalsPage.pendingPbaRowsByText(NEW_PBA_ORG_SEARCH).first()).toBeVisible();
  });

  test('Search by organisation in active organisations', { tag: '@refdata-search' }, async ({ organisationApprovalsPage, page }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.openActiveOrganisationsTab();
    expect(page.url(), 'Expected the active organisations route after selecting the Active organisations tab').toContain(
      '/organisation/active'
    );
    await expect(organisationApprovalsPage.activeOrganisationsPanel.or(organisationApprovalsPage.serviceErrorHeading)).toBeVisible();
    await expect(organisationApprovalsPage.serviceErrorHeading, 'RefData failed while opening Active organisations for search').toHaveCount(0);
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();

    const activeSearchResponse = page.waitForResponse(
      (response) => {
        const url = new URL(response.url());
        const request = response.request();
        if (request.method() !== 'POST' || url.pathname !== '/api/organisations' || url.searchParams.get('status') !== 'ACTIVE') {
          return false;
        }
        const requestBody = request.postDataJSON() as { searchRequest?: { search_filter?: string } } | null;
        return requestBody?.searchRequest?.search_filter === ACTIVE_ORG_SEARCH;
      },
      { timeout: ACTIVE_SEARCH_RESPONSE_TIMEOUT }
    );
    await organisationApprovalsPage.searchForOrganisation(ACTIVE_ORG_SEARCH);
    expect((await activeSearchResponse).status(), 'Active organisation search must return HTTP 200').toBe(200);
    await organisationApprovalsPage.waitForActiveOrganisationResults();

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(ACTIVE_ORG_SEARCH).first()).toBeVisible();
  });
});

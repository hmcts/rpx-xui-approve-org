import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

const NEW_REGISTRATION_ORG_SEARCH = 'Test';
const ACTIVE_ORG_SEARCH = 'test';
const NEW_REGISTRATION_ADDRESS_SEARCH = 'SE15TY';
const NEW_PBA_ORG_SEARCH = 'test';

test.describe('Organisation approvals search', { tag: ['@e2e', '@organisations', '@search'] }, () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedPage(page, 'base');
  });

  test('Search by organisation in new registrations', async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisation(NEW_REGISTRATION_ORG_SEARCH);
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);

    await expect(organisationApprovalsPage.pendingOrganisationRowsByName(NEW_REGISTRATION_ORG_SEARCH).first()).toBeVisible();
  });

  test('Search by organisation in active organisations', async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.activeOrganisationsPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisation(ACTIVE_ORG_SEARCH);
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);

    await expect(organisationApprovalsPage.activeOrganisationRowsByText(ACTIVE_ORG_SEARCH).first()).toBeVisible();
  });

  test('Search by address in new registrations', async ({ organisationApprovalsPage }) => {
    await expect(organisationApprovalsPage.heading).toBeVisible();
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);
    await expect(organisationApprovalsPage.pendingOverviewPanel).toBeVisible();

    await organisationApprovalsPage.searchForOrganisation(NEW_REGISTRATION_ADDRESS_SEARCH);
    await organisationApprovalsPage.waitForSpinnerToHide(60_000);

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
});

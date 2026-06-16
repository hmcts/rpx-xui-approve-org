import { test } from './helpers/integration.fixtures';
import {
  assertActiveOrganisationDetailsPage,
  assertActiveOrganisationListPage,
  assertActiveOrganisationListReady,
  assertActiveOrganisationUsersVisible,
  assertApproveOrganisationConfirmPage,
  assertDeleteOrganisationAvailable,
  assertDeleteOrganisationConfirmPage,
  assertPendingOrganisationDetailsPage,
  assertPendingOrganisationListPage,
  assertPendingOrganisationListReady,
  setupNavigationLinksIntegrationPage
} from './helpers/navigation-links.helpers';

test.describe('Playwright integration: organisation backlink navigation', {
  tag: ['@integration', '@organisations', '@navigation-links']
}, () => {
  test('Pending org details back link returns to pending list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await assertPendingOrganisationListReady(organisationApprovalsPage, pendingOrganisationName);
    await organisationApprovalsPage.openFirstPendingOrganisation();
    await assertPendingOrganisationDetailsPage(page, organisationApprovalsPage, pendingOrganisationId);

    await organisationApprovalsPage.clickBackLink();
    await assertPendingOrganisationListPage(page, organisationApprovalsPage, pendingOrganisationName);
  });

  test('Active org details back link returns to active list', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await assertActiveOrganisationListReady(organisationApprovalsPage, activeOrganisationName);
    await organisationApprovalsPage.openFirstActiveOrganisation();
    await assertActiveOrganisationDetailsPage(page, organisationApprovalsPage, activeOrganisationId);

    await organisationApprovalsPage.clickBackLink();
    await assertActiveOrganisationListPage(page, organisationApprovalsPage, activeOrganisationName);
  });

  test('Confirm decision back link returns to pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await assertPendingOrganisationListReady(organisationApprovalsPage, pendingOrganisationName);
    await organisationApprovalsPage.openFirstPendingOrganisation();
    await assertPendingOrganisationDetailsPage(page, organisationApprovalsPage, pendingOrganisationId);

    await organisationApprovalsPage.chooseDecision('Approve it');
    await organisationApprovalsPage.submitDecision();

    await assertApproveOrganisationConfirmPage(page, organisationApprovalsPage);

    await organisationApprovalsPage.clickBackLink();
    await assertPendingOrganisationDetailsPage(page, organisationApprovalsPage, pendingOrganisationId);
  });

  test('Delete confirm page back link returns to active details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      activeOrganisationId,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await assertActiveOrganisationListReady(organisationApprovalsPage, activeOrganisationName);
    await organisationApprovalsPage.openFirstActiveOrganisation();
    await assertActiveOrganisationDetailsPage(page, organisationApprovalsPage, activeOrganisationId);
    await assertDeleteOrganisationAvailable(organisationApprovalsPage);

    await organisationApprovalsPage.deleteActiveOrganisation();
    await assertDeleteOrganisationConfirmPage(page, organisationApprovalsPage);

    await organisationApprovalsPage.clickBackLink();
    await assertActiveOrganisationDetailsPage(page, organisationApprovalsPage, activeOrganisationId);
  });

  test('Active users tab back link returns to active list, then pending list, then pending details', async ({ page }) => {
    const {
      organisationApprovalsPage,
      pendingOrganisationId,
      pendingOrganisationName,
      activeOrganisationName
    } = await setupNavigationLinksIntegrationPage(page);

    await organisationApprovalsPage.openActiveOrganisationsTab();
    await assertActiveOrganisationListReady(organisationApprovalsPage, activeOrganisationName);
    await organisationApprovalsPage.openFirstActiveOrganisation();

    await organisationApprovalsPage.openUsersTab();
    await assertActiveOrganisationUsersVisible(organisationApprovalsPage);

    await organisationApprovalsPage.clickBackLink();
    await assertActiveOrganisationListPage(page, organisationApprovalsPage, activeOrganisationName);

    await organisationApprovalsPage.openPendingOrganisationsTab();
    await assertPendingOrganisationListPage(page, organisationApprovalsPage, pendingOrganisationName);

    await organisationApprovalsPage.openFirstPendingOrganisation();
    await assertPendingOrganisationDetailsPage(page, organisationApprovalsPage, pendingOrganisationId);
  });
});

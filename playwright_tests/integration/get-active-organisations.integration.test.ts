import { test } from './helpers/integration.fixtures';
import {
  assertActiveOrganisationsPanelVisible,
  assertOrganisationApprovalsUi
} from './helpers/organisation-approvals.helpers';
import {
  ACTIVE_ORGANISATIONS_TABLE_SELECTOR,
  PENDING_ORGANISATIONS_TABLE_SELECTOR,
  setupCommonOrganisationApiMocks,
  waitForOrganisationNameInTable,
  waitForOrganisationStatusResponse
} from './mocks';

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@organisations'] }, () => {
  test('Organisation approvals renders mocked pending and active organisations', async ({ page }) => {
    const { pendingOrganisations, activeOrganisations } = await setupCommonOrganisationApiMocks(page);
    const pendingResponse = waitForOrganisationStatusResponse(page, 'PENDING,REVIEW');

    const organisationApprovalsPage = await assertOrganisationApprovalsUi(page);
    await pendingResponse;
    await waitForOrganisationNameInTable(page, PENDING_ORGANISATIONS_TABLE_SELECTOR, pendingOrganisations[0].name);

    const activeResponse = waitForOrganisationStatusResponse(page, 'ACTIVE');
    await organisationApprovalsPage.openActiveOrganisationsTab();
    await activeResponse;
    await assertActiveOrganisationsPanelVisible(organisationApprovalsPage);
    await waitForOrganisationNameInTable(page, ACTIVE_ORGANISATIONS_TABLE_SELECTOR, activeOrganisations[0].name);
  });
});

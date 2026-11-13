import { test, expect } from '../page-objects/page.fixtures';
import { openPendingPbaDecisions } from './helpers/pending-pba-decisions.helpers';
import {
  setupSetPbaStatusApiMock, setupUpdatePbaApiMock, waitForPendingPbaStatusResponse,
  waitForSetPbaStatusResponse, waitForUpdatePbaResponse
} from './mocks';
import {
  FIRST_PENDING_PBA, SECOND_PENDING_PBA, PBA_ACCOUNT_NAMES,
  PBA_DECISION_ORG_ID, UPDATED_PENDING_PBA, buildPendingPbaDecisionState, mixedPbaDecisionPayload
} from './test-data/pending-pba-decisions.data';

test.describe('New PBAs decisions', { tag: ['@pending-pbas', '@pending-decisions', '@positive'] }, () => {
  test('Change opens and submits the selected pending account', async ({
    page, organisationApprovalsPage, updatePbaPage
  }) => {
    const state = buildPendingPbaDecisionState();
    await openPendingPbaDecisions(page, organisationApprovalsPage, state);
    const updateMock = await setupUpdatePbaApiMock(page, {
      singleOrganisationsById: state.organisations.singleOrganisationsById
    });
    await expect(organisationApprovalsPage.pendingPbaDecisionRow(FIRST_PENDING_PBA)).toContainText(PBA_ACCOUNT_NAMES[0]);
    await expect(organisationApprovalsPage.pendingPbaDecisionRow(SECOND_PENDING_PBA)).toContainText(PBA_ACCOUNT_NAMES[1]);
    await organisationApprovalsPage.changePendingPba(SECOND_PENDING_PBA);
    await expect(page).toHaveURL(new RegExp(`/change/pba/${PBA_DECISION_ORG_ID}/${SECOND_PENDING_PBA}$`));
    await expect(updatePbaPage.pbaInputAt(1)).toHaveValue(SECOND_PENDING_PBA);
    await expect(updatePbaPage.pbaInputAt(2)).toHaveCount(0);
    await updatePbaPage.updatePbaNumber(UPDATED_PENDING_PBA);
    const updateResponse = waitForUpdatePbaResponse(page);
    await updatePbaPage.submit();
    expect((await updateResponse).status()).toBe(200);
    expect(updateMock.getLastPayload()).toEqual({
      paymentAccounts: [UPDATED_PENDING_PBA], orgId: PBA_DECISION_ORG_ID
    });
    await expect(page).toHaveURL(new RegExp(`/organisation-details/${PBA_DECISION_ORG_ID}$`));
    await expect(organisationApprovalsPage.organisationDetailsPbaRow(UPDATED_PENDING_PBA)).toBeVisible();
  });

  test('submits mixed decisions for the correct pending accounts and returns to the list', async ({
    page, organisationApprovalsPage
  }) => {
    const state = buildPendingPbaDecisionState();
    await openPendingPbaDecisions(page, organisationApprovalsPage, state);
    const statusMock = await setupSetPbaStatusApiMock(page, { pendingPbaOrganisations: state.pendingPbaOrganisations });
    await organisationApprovalsPage.choosePendingPbaDecision(FIRST_PENDING_PBA, 'accepted');
    await organisationApprovalsPage.choosePendingPbaDecision(SECOND_PENDING_PBA, 'rejected');
    await organisationApprovalsPage.continuePendingPbaDecision();
    await expect(organisationApprovalsPage.pendingPbaConfirmationRow(FIRST_PENDING_PBA)).toContainText(PBA_ACCOUNT_NAMES[0]);
    await expect(organisationApprovalsPage.pendingPbaConfirmationRow(FIRST_PENDING_PBA)).toContainText('Approve the account');
    await expect(organisationApprovalsPage.pendingPbaConfirmationRow(SECOND_PENDING_PBA)).toContainText(PBA_ACCOUNT_NAMES[1]);
    await expect(organisationApprovalsPage.pendingPbaConfirmationRow(SECOND_PENDING_PBA)).toContainText('Reject the account');
    const responsePromise = waitForSetPbaStatusResponse(page);
    const refreshedList = waitForPendingPbaStatusResponse(page);
    await organisationApprovalsPage.confirmDecision();
    const response = await responsePromise;
    expect(response.request().method()).toBe('PUT');
    expect(statusMock.getLastPayload()).toEqual(mixedPbaDecisionPayload);
    expect((await refreshedList).status()).toBe(200);
    await expect(page).toHaveURL(/\/organisation\/pbas$/);
    await expect(organisationApprovalsPage.successBanner('PBA numbers updated')).toBeVisible();
    await expect(organisationApprovalsPage.pendingPbasPanel).toBeVisible();
    await expect(organisationApprovalsPage.pendingPbaEmptyState).toBeVisible();
    await expect(organisationApprovalsPage.pendingPbaRows).toHaveCount(0);
  });
});

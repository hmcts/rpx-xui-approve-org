import { test, expect } from '../page-objects/page.fixtures';
import { openPendingPbaDecisions } from './helpers/pending-pba-decisions.helpers';
import { setupSetPbaStatusApiMock, waitForSetPbaStatusResponse, waitForSetPbaStatusResponseWithHttpStatus } from './mocks';
import {
  FIRST_PENDING_PBA, SECOND_PENDING_PBA, INVALID_PENDING_PBA, PBA_DECISION_ORG_ID,
  PBA_VALIDATION_MESSAGE, buildPendingPbaDecisionState, mixedPbaDecisionPayload,
  inactivePbaOrganisationResponse, invalidPbaStatusResponse
} from './test-data/pending-pba-decisions.data';

test.describe('New PBAs decision failures', { tag: ['@pending-pbas', '@pending-decisions', '@negative'] }, () => {
  for (const selectedFirst of [false, true]) {
    test(`requires every decision when ${selectedFirst ? 'one account is undecided' : 'no accounts are decided'}`, async ({ page, organisationApprovalsPage }) => {
      await openPendingPbaDecisions(page, organisationApprovalsPage);
      const statusMock = await setupSetPbaStatusApiMock(page);
      if (selectedFirst) {
        await organisationApprovalsPage.choosePendingPbaDecision(FIRST_PENDING_PBA, 'accepted');
      }
      await organisationApprovalsPage.continuePendingPbaDecision();
      await expect(organisationApprovalsPage.pendingPbaValidationSummary).toContainText('Select the decision for the PBA account');
      await expect(organisationApprovalsPage.pendingPbaDecisionRow(SECOND_PENDING_PBA)).toContainText('Select the decision for the PBA account');
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeHidden();
      expect(statusMock.getLastPayload()).toBeUndefined();
    });
  }

  test('keeps confirmation visible when the organisation is no longer active', async ({ page, organisationApprovalsPage }) => {
    await openPendingPbaDecisions(page, organisationApprovalsPage);
    const statusMock = await setupSetPbaStatusApiMock(page, {
      status: 400,
      responseBody: inactivePbaOrganisationResponse
    });
    await organisationApprovalsPage.choosePendingPbaDecision(FIRST_PENDING_PBA, 'accepted');
    await organisationApprovalsPage.choosePendingPbaDecision(SECOND_PENDING_PBA, 'rejected');
    await organisationApprovalsPage.continuePendingPbaDecision();
    const responsePromise = waitForSetPbaStatusResponse(page);
    await organisationApprovalsPage.confirmDecision();
    expect((await responsePromise).status()).toBe(400);
    expect(statusMock.getLastPayload()).toEqual(mixedPbaDecisionPayload);
    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
    await expect(organisationApprovalsPage.validationSummary).toContainText('Activate organisation before managing PBA.');
    await expect(organisationApprovalsPage.successBanner('PBA numbers updated')).toBeHidden();
  });

  test('shows the service-down view when submitting decisions fails unexpectedly', async ({
    page, organisationApprovalsPage, errorPage
  }) => {
    await openPendingPbaDecisions(page, organisationApprovalsPage);
    const statusMock = await setupSetPbaStatusApiMock(page, { status: 500 });
    await organisationApprovalsPage.choosePendingPbaDecision(FIRST_PENDING_PBA, 'accepted');
    await organisationApprovalsPage.choosePendingPbaDecision(SECOND_PENDING_PBA, 'rejected');
    await organisationApprovalsPage.continuePendingPbaDecision();
    const responsePromise = waitForSetPbaStatusResponseWithHttpStatus(page, 500);
    await organisationApprovalsPage.confirmDecision();
    expect((await responsePromise).status()).toBe(500);
    expect(statusMock.getLastPayload()).toEqual(mixedPbaDecisionPayload);
    await expect(page).toHaveURL(/\/service-down$/);
    await expect(errorPage.heading).toHaveText('Sorry, there is a problem with the service');
    await expect(errorPage.body).toHaveText('Try again later.');
    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeHidden();
    await expect(organisationApprovalsPage.successBanner('PBA numbers updated')).toBeHidden();
  });

  test('shows invalid PBA errors without a success confirmation', async ({ page, organisationApprovalsPage }) => {
    await openPendingPbaDecisions(page, organisationApprovalsPage, buildPendingPbaDecisionState([INVALID_PENDING_PBA]));
    const statusMock = await setupSetPbaStatusApiMock(page, {
      status: 422,
      responseBody: invalidPbaStatusResponse
    });
    await organisationApprovalsPage.choosePendingPbaDecision(INVALID_PENDING_PBA, 'accepted');
    await organisationApprovalsPage.continuePendingPbaDecision();
    const responsePromise = waitForSetPbaStatusResponse(page);
    await organisationApprovalsPage.confirmDecision();
    expect((await responsePromise).status()).toBe(422);
    expect(statusMock.getLastPayload()).toEqual({
      orgId: PBA_DECISION_ORG_ID,
      pbaNumbers: [{ pbaNumber: INVALID_PENDING_PBA, status: 'accepted', statusMessage: '' }]
    });
    await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
    await expect(organisationApprovalsPage.successBanner('PBA numbers updated')).toBeHidden();
    let submissionError: unknown;
    try {
      await expect(organisationApprovalsPage.pendingPbaSubmissionErrors).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaSubmissionErrors).toContainText(PBA_VALIDATION_MESSAGE);
    } catch (error) {
      await expect(page).toHaveURL(new RegExp(`/organisation/pbas/new/${PBA_DECISION_ORG_ID}$`));
      await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();
      await expect(organisationApprovalsPage.pendingPbaSubmissionErrors).toHaveCount(0);
      submissionError = error;
    }
    test.fail(true, 'EXUI-1435: new-pbas template does not bind the emitted PBA submission errors');
    expect(submissionError).toBeUndefined();
  });
});

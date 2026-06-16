import { test } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  assertPendingDecisionConfirmPage,
  assertPendingDecisionDetailsPage,
  assertPendingDecisionRequest,
  assertPendingDecisionSuccess
} from './helpers/pending-decisions.helpers';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock,
  waitForPendingOrganisationDecisionResponse
} from './mocks';
import { decisionScenarios } from './test-data/pending-decisions.data';

test.describe('Playwright integration: pending decision matrix', { tag: ['@integration', '@organisations', '@pending-decisions'] }, () => {
  for (const scenario of decisionScenarios) {
    test(`Pending registration decision: ${scenario.idSuffix}`, async ({ page }) => {
      const organisationId = `PENDING-${scenario.idSuffix.toUpperCase()}-001`;
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
      const decisionApiMock = await setupPendingOrganisationDecisionApiMock(page, { organisationId });

      await ensureAuthenticatedPage(page, 'base');
      const organisationDetailsUrl = new URL(`/organisation-details/${organisationId}`, config.baseUrl).toString();
      await page.goto(organisationDetailsUrl);

      await assertPendingDecisionDetailsPage(page);
      await page.getByLabel(scenario.decisionLabel).check();
      await page.getByRole('button', { name: 'Submit' }).click();
      await assertPendingDecisionConfirmPage(page);

      const decisionResponse = waitForPendingOrganisationDecisionResponse(page, organisationId);
      await page.getByRole('button', { name: 'Confirm' }).click();
      await decisionResponse;

      assertPendingDecisionRequest(
        decisionApiMock,
        scenario.expectedMethod,
        organisationId,
        scenario.expectedStatus
      );
      await assertPendingDecisionSuccess(page, scenario.successBannerText);
    });
  }
});

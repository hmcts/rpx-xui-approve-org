import { expect } from '@playwright/test';
import { test } from './helpers/integration.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import { OrganisationApprovalsPage } from '../page-objects/pages';
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
      const decisionApiMock = await test.step('Setup mocked pending organisation APIs', async () => {
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
        return setupPendingOrganisationDecisionApiMock(page, { organisationId });
      });

      const organisationApprovalsPage = await test.step('Open pending organisation details', async () => {
        await ensureAuthenticatedPage(page, 'base');
        const organisationDetailsUrl = new URL(`/organisation-details/${organisationId}`, config.baseUrl).toString();
        await page.goto(organisationDetailsUrl);
        const approvalsPage = new OrganisationApprovalsPage(page);
        await expect(approvalsPage.approveOrganisationHeading).toBeVisible();
        return approvalsPage;
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
        expect(decisionApiMock.getLastMethod()).toEqual(scenario.expectedMethod);
        if (scenario.expectedStatus) {
          const lastPayload = decisionApiMock.getLastPayload();
          expect(lastPayload?.organisationIdentifier).toEqual(organisationId);
          expect(lastPayload?.status).toEqual(scenario.expectedStatus);
        }
        await expect(page).toHaveURL(/\/organisation\/pending/);
        await expect(organisationApprovalsPage.successBanner(scenario.successBannerText)).toBeVisible();
      });
    });
  }
});

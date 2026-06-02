import { test, expect } from './helpers/integration.fixtures';
import { runAxeAudit } from '../helpers/axe';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock,
  waitForPendingOrganisationDecisionResponse
} from './mocks';

type DecisionScenario = {
  idSuffix: string;
  decisionLabel: string | RegExp;
  expectedMethod: 'PUT' | 'DELETE';
  expectedStatus?: 'ACTIVE' | 'REVIEW';
  successBannerText: RegExp;
};

const decisionScenarios: DecisionScenario[] = [
  {
    idSuffix: 'approve',
    decisionLabel: 'Approve it',
    expectedMethod: 'PUT',
    expectedStatus: 'ACTIVE',
    successBannerText: /Registration approved/i
  },
  {
    idSuffix: 'reject',
    decisionLabel: 'Reject it',
    expectedMethod: 'DELETE',
    successBannerText: /Registration rejected/i
  },
  {
    idSuffix: 'review',
    decisionLabel: /Place registration under review/i,
    expectedMethod: 'PUT',
    expectedStatus: 'REVIEW',
    successBannerText: /Registration put under review/i
  }
];

test.describe('Playwright integration: pending decision matrix', { tag: ['@integration', '@organisations', '@pending-decisions'] }, () => {
  for (const scenario of decisionScenarios) {
    test(`Pending registration decision: ${scenario.idSuffix}`, async ({ page }, testInfo) => {
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

      await expect(page.getByRole('heading', { name: 'Approve organisation' })).toBeVisible();
      await runAxeAudit(page, testInfo, { reportName: `Integration pending ${scenario.idSuffix} details` });
      await page.getByLabel(scenario.decisionLabel).check();
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByRole('heading', { name: 'Confirm your decision' })).toBeVisible();
      await runAxeAudit(page, testInfo, { reportName: `Integration pending ${scenario.idSuffix} confirm` });

      const decisionResponse = waitForPendingOrganisationDecisionResponse(page, organisationId);
      await page.getByRole('button', { name: 'Confirm' }).click();
      await decisionResponse;

      expect(decisionApiMock.getLastMethod()).toBe(scenario.expectedMethod);

      if (scenario.expectedStatus) {
        const lastPayload = decisionApiMock.getLastPayload() as { organisationIdentifier?: string; status?: string } | undefined;
        expect(lastPayload?.organisationIdentifier).toBe(organisationId);
        expect(lastPayload?.status).toBe(scenario.expectedStatus);
      }

      await expect(page).toHaveURL(/\/organisation\/pending/);
      await expect(page.getByText(scenario.successBannerText)).toBeVisible();
      await runAxeAudit(page, testInfo, { reportName: `Integration pending ${scenario.idSuffix} success` });
    });
  }
});

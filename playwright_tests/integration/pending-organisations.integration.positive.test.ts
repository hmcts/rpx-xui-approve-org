import { test, expect } from '../page-objects/page.fixtures';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';
import { config } from '../config/config';
import {
  createMockOrganisation,
  setupCommonOrganisationApiMocks,
  setupLovRefDataApiMock,
  setupPbaAccountsApiMock,
  setupPendingOrganisationDecisionApiMock,
} from './mocks';
import { decisionScenarios } from './test-data/pending-decisions.data';

test.describe(
  'Playwright integration: pending decision matrix',
  { tag: ['@integration', '@organisations', '@pending-decisions'] },
  () => {
    for (const scenario of decisionScenarios) {
      test(`Pending registration decision: ${scenario.idSuffix}`, async ({ page, organisationApprovalsPage }) => {
        const organisationId = `PENDING-${scenario.idSuffix.toUpperCase()}-001`;
        let decisionApiMock: { getLastMethod: any; getLastPayload: any };

        await test.step('Setup mocked pending organisation APIs', async () => {
          const mockedPendingOrganisation = createMockOrganisation({
            organisationIdentifier: organisationId,
            name: `Pending ${scenario.idSuffix} org`,
            status: 'PENDING',
            paymentAccount: [],
            pendingPaymentAccount: ['PBA1111111'],
          });

          await setupCommonOrganisationApiMocks(page, {
            pendingOrganisations: [mockedPendingOrganisation],
            singleOrganisationsById: {
              [organisationId]: mockedPendingOrganisation,
            },
          });
          await setupPbaAccountsApiMock(page, ['Mock Liberata Account']);
          await setupLovRefDataApiMock(page, []);
          decisionApiMock = await setupPendingOrganisationDecisionApiMock(page, { organisationId });
        });

        await test.step('Open pending organisation details', async () => {
          await ensureAuthenticatedPage(page, 'base');
          const organisationDetailsUrl = new URL(`/organisation-details/${organisationId}`, config.baseUrl).toString();
          await page.goto(organisationDetailsUrl);
          await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
        });

        await test.step(`Submit ${scenario.idSuffix} decision`, async () => {
          await organisationApprovalsPage.chooseDecision(scenario.decisionLabel);
          await organisationApprovalsPage.submitDecision();
          await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();

          await organisationApprovalsPage.confirmDecision();
        });

        await test.step('Verify decision request and success banner', async () => {
          await expect(page).toHaveURL(/\/organisation\/pending/);
          await expect(organisationApprovalsPage.successBanner(scenario.successBannerText)).toBeVisible();
          expect(decisionApiMock?.getLastMethod()).toEqual(scenario.expectedMethod);
          if (scenario.expectedStatus) {
            expect(decisionApiMock?.getLastPayload()).toEqual({
              organisationIdentifier: organisationId,
              sraId: 'SRA12345',
              contactInformation: [
                {
                  addressLine1: '1 Mock Street',
                  addressLine2: 'Mock District',
                  townCity: 'London',
                  county: 'Greater London',
                  dxAddress: [{ dxNumber: 'DX 100', dxExchange: 'London' }],
                },
              ],
              superUser: {
                userIdentifier: 'Mock Admin',
                firstName: 'Mock Admin',
                lastName: 'Mock Admin',
                email: 'mock-admin@example.com',
              },
              status: scenario.expectedStatus,
              name: `Pending ${scenario.idSuffix} org`,
              paymentAccount: [],
              pendingPaymentAccount: ['PBA1111111'],
              orgAttributes: [],
              companyNumber: '12345678',
              orgType: 'SOLICITOR',
            });
          } else {
            expect(decisionApiMock?.getLastPayload()).toBeNull();
          }
        });
      });
    }
  }
);

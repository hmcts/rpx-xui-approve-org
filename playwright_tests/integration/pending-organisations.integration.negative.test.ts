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

const PENDING_ORGANISATION_DECISION_API_ERROR_STATUSES = [400, 403, 404, 500];
const PENDING_ORGANISATION_ID = 'PENDING-APPROVE-NEGATIVE-001';
const PENDING_ORGANISATION_NAME = 'Pending approve negative org';

test.describe(
  'Playwright integration: pending organisation decision negative paths',
  { tag: ['@integration', '@organisations', '@pending-decisions', '@negative'] },
  () => {
    for (const apiStatusCode of PENDING_ORGANISATION_DECISION_API_ERROR_STATUSES) {
      test(`Pending registration approval handles API status ${apiStatusCode}`, async ({ page, organisationApprovalsPage }) => {
        let decisionApiMock: { getLastMethod: any; getLastPayload: any };

        await test.step('Setup mocked pending organisation APIs', async () => {
          const mockedPendingOrganisation = createMockOrganisation({
            organisationIdentifier: PENDING_ORGANISATION_ID,
            name: PENDING_ORGANISATION_NAME,
            status: 'PENDING',
            paymentAccount: [],
            pendingPaymentAccount: ['PBA1111111'],
          });

          await setupCommonOrganisationApiMocks(page, {
            pendingOrganisations: [mockedPendingOrganisation],
            singleOrganisationsById: {
              [PENDING_ORGANISATION_ID]: mockedPendingOrganisation,
            },
          });
          await setupPbaAccountsApiMock(page, ['Mock Liberata Account']);
          await setupLovRefDataApiMock(page, []);
          decisionApiMock = await setupPendingOrganisationDecisionApiMock(page, {
            organisationId: PENDING_ORGANISATION_ID,
            status: 500,
            responseBody: {
              apiError: `Mock pending organisation approval error ${apiStatusCode}`,
              apiStatusCode,
              message: 'handlePutOrganisationRoute error',
            },
          });
        });

        await test.step('Open pending organisation details', async () => {
          await ensureAuthenticatedPage(page, 'base');
          const organisationDetailsUrl = new URL(`/organisation-details/${PENDING_ORGANISATION_ID}`, config.baseUrl).toString();
          await page.goto(organisationDetailsUrl);
          await expect(organisationApprovalsPage.approveOrganisationHeading).toBeVisible();
        });

        await test.step('Submit approve decision', async () => {
          await organisationApprovalsPage.chooseDecision('Approve it');
          await organisationApprovalsPage.submitDecision();
          await expect(organisationApprovalsPage.confirmDecisionHeading).toBeVisible();

          await organisationApprovalsPage.confirmDecision();
        });

        await test.step('Verify approval request and error outcome', async () => {
          expect(decisionApiMock?.getLastMethod()).toEqual('PUT');
          expect(decisionApiMock?.getLastPayload()).toEqual({
            organisationIdentifier: PENDING_ORGANISATION_ID,
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
            status: 'ACTIVE',
            name: PENDING_ORGANISATION_NAME,
            paymentAccount: [],
            pendingPaymentAccount: ['PBA1111111'],
            orgAttributes: [],
            companyNumber: '12345678',
            orgType: 'SOLICITOR',
          });
          await expect(page).toHaveURL(/\/approve-organisations/);
          await expect(organisationApprovalsPage.confirmDecisionErrorSummary).toBeVisible();
          await expect(organisationApprovalsPage.confirmDecisionErrorSummaryTitle).toHaveText(
            'Sorry, there is a problem with the service'
          );
        });
      });
    }
  }
);

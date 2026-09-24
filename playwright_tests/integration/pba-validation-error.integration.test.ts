import { expect, test } from './helpers/integration.fixtures';
import { setupOrganisationSearchIntegrationPage } from './helpers/organisation-search.helpers';
import {
  createMockOrganisation,
  createMockPendingPbaOrganisation,
  setupSetPbaStatusApiMock,
  waitForSetPbaStatusResponse
} from './mocks';

const INVALID_PBA_ORG_ID = 'PBAINVALID01';
const INVALID_PBA_NUMBER = 'ABC1234567';
const INVALID_PBA_ERROR_MESSAGE = 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters';
const INVALID_PBA_VALIDATION_SUMMARY_MESSAGE = 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters';

test.describe('Playwright integration: PBA validation', { tag: ['@integration', '@organisations', '@pending-decisions'] }, () => {
  test('shows the PBA validation error when approving an invalid new PBA', async ({ page }) => {
    const invalidPendingPba = createMockPendingPbaOrganisation({
      organisationIdentifier: INVALID_PBA_ORG_ID,
      organisationName: 'Invalid PBA Mock Org',
      pbaNumbers: [{
        pbaNumber: INVALID_PBA_NUMBER,
        dateCreated: new Date('2024-01-15T00:00:00.000Z').toISOString()
      }]
    });

    const { organisationApprovalsPage } = await setupOrganisationSearchIntegrationPage(page, {
      pendingPbaOrganisations: [invalidPendingPba],
      organisations: {
        singleOrganisationsById: {
          [INVALID_PBA_ORG_ID]: createMockOrganisation({
            organisationIdentifier: INVALID_PBA_ORG_ID,
            name: 'Invalid PBA Mock Org',
            status: 'PENDING',
            paymentAccount: [],
            pendingPaymentAccount: [INVALID_PBA_NUMBER]
          })
        }
      }
    });

    const updatePbaApiMock = await setupSetPbaStatusApiMock(page, {
      status: 422,
      responseBody: {
        pbaUpdateStatusResponses: [
          {
            pbaNumber: INVALID_PBA_NUMBER,
            errorMessage: INVALID_PBA_ERROR_MESSAGE
          }
        ]
      }
    });

    const updateResponse = waitForSetPbaStatusResponse(page);
    await organisationApprovalsPage.approveFirstInvalidPbaAndExpectValidationError();
    await updateResponse;

    await expect(organisationApprovalsPage.validationSummary).toBeVisible();
    await expect(organisationApprovalsPage.validationSummary).toContainText('There is a problem');
    await expect(organisationApprovalsPage.validationSummary).toContainText(INVALID_PBA_VALIDATION_SUMMARY_MESSAGE);

    expect(updatePbaApiMock.getLastPayload()).toEqual({
      orgId: INVALID_PBA_ORG_ID,
      pbaNumbers: [
        {
          pbaNumber: INVALID_PBA_NUMBER,
          status: 'accepted',
          statusMessage: ''
        }
      ]
    });
  });
});

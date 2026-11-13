import { createMockOrganisation, createMockPendingPbaOrganisation } from '../mocks';

export const PBA_DECISION_ORG_ID = 'PBADECISIONS01';
export const UNRELATED_PENDING_ORG_ID = 'PBADECISIONS02';
export const UNRELATED_PENDING_ORG_NAME = 'Unrelated Pending PBA Org';
export const APPROVED_PBA = 'PBA7100000';
export const FIRST_PENDING_PBA = 'PBA7100001';
export const SECOND_PENDING_PBA = 'PBA7100002';
export const UPDATED_PENDING_PBA = 'PBA7100003';
export const INVALID_PENDING_PBA = 'ABC1234567';
export const PBA_ACCOUNT_NAMES = ['First Pending Account', 'Second Pending Account'];
export const PBA_VALIDATION_MESSAGE = 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters';

export const inactivePbaOrganisationResponse = { errorDescription: 'The requested Organisation is not \'Active\'' };
export const invalidPbaStatusResponse = {
  pbaUpdateStatusResponses: [{ pbaNumber: INVALID_PENDING_PBA, errorMessage: PBA_VALIDATION_MESSAGE }]
};

export function buildPendingPbaDecisionState(pbas = [FIRST_PENDING_PBA, SECOND_PENDING_PBA]) {
  return {
    accountNames: PBA_ACCOUNT_NAMES,
    pendingPbaOrganisations: [
      createMockPendingPbaOrganisation({
        organisationIdentifier: PBA_DECISION_ORG_ID,
        organisationName: 'Pending PBA Decisions Org',
        pbaNumbers: pbas.map((pbaNumber) => ({ pbaNumber, dateCreated: '2024-01-15T00:00:00.000Z' }))
      }),
      createMockPendingPbaOrganisation({
        organisationIdentifier: UNRELATED_PENDING_ORG_ID,
        organisationName: UNRELATED_PENDING_ORG_NAME,
        pbaNumbers: [{ pbaNumber: 'PBA7200000', dateCreated: '2024-01-16T00:00:00.000Z' }]
      })
    ],
    organisations: {
      singleOrganisationsById: {
        [PBA_DECISION_ORG_ID]: createMockOrganisation({
          organisationIdentifier: PBA_DECISION_ORG_ID,
          name: 'Pending PBA Decisions Org',
          status: 'ACTIVE',
          paymentAccount: [APPROVED_PBA],
          pendingPaymentAccount: pbas
        })
      }
    }
  };
}

export const mixedPbaDecisionPayload = {
  orgId: PBA_DECISION_ORG_ID,
  pbaNumbers: [
    { pbaNumber: FIRST_PENDING_PBA, status: 'accepted', statusMessage: '' },
    { pbaNumber: SECOND_PENDING_PBA, status: 'rejected', statusMessage: '' }
  ]
};

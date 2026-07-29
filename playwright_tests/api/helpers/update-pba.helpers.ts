export const UPDATE_PBA_INVALID_ORG_ID_ERROR_STATUSES = [400, 403, 404, 422] as const;

export type UpdatePbaMalformedCase = {
  name: string;
  expectedStatuses: readonly number[];
  buildPayload: (organisationId: string) => Record<string, unknown>;
};

export const UPDATE_PBA_MALFORMED_CASES: UpdatePbaMalformedCase[] = [
  {
    name: 'empty request body',
    buildPayload: () => ({}),
    expectedStatuses: [400]
  },
  {
    name: 'missing orgId',
    buildPayload: () => ({ paymentAccounts: ['PBA33L6BNO'] }),
    expectedStatuses: [400]
  },
  {
    name: 'invalid orgId',
    buildPayload: () => ({ paymentAccounts: ['PBA33L6BNO'], orgId: 'INVALID_ORG_ID_12345' }),
    expectedStatuses: UPDATE_PBA_INVALID_ORG_ID_ERROR_STATUSES
  },
  {
    name: 'invalid paymentAccounts type',
    buildPayload: (organisationId) => ({ paymentAccounts: 'PBA33L6BNO', orgId: organisationId }),
    expectedStatuses: [400]
  }
];

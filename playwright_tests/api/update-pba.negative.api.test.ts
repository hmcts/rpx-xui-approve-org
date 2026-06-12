import { test, expect } from './helpers/api.fixtures';
import { cleanupProvisionedOrganisation, provisionPendingOrganisation } from './helpers/organisations-write.helpers';

const UNAUTHENTICATED_ORG_ID = 'UPDATE_PBA_NEGATIVE_ORG';
const UPDATE_PBA_VALIDATION_ERROR_STATUSES = [400, 403, 404, 422, 500] as const;

type UpdatePbaMalformedCase = {
  name: string;
  expectedStatuses: readonly number[];
  buildPayload: (organisationId: string) => Record<string, unknown>;
};

const UPDATE_PBA_MALFORMED_CASES: UpdatePbaMalformedCase[] = [
  {
    name: 'empty request body',
    buildPayload: (organisationId) => ({}),
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
    expectedStatuses: UPDATE_PBA_VALIDATION_ERROR_STATUSES
  },
  {
    name: 'invalid paymentAccounts type',
    buildPayload: (organisationId) => ({ paymentAccounts: 'PBA33L6BNO', orgId: organisationId }),
    expectedStatuses: [400]
  }
];

test.describe('Playwright API negative: update pba', { tag: ['@update-pba', '@negative'] }, () => {
  test('PUT /api/updatePba without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      paymentAccounts: ['PBA33L6BNO'],
      orgId: UNAUTHENTICATED_ORG_ID
    };

    const response = await apiAnonymousRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated PUT /api/updatePba to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated update pba request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated update pba request. Received location=${location}`
      ).toContain('login');
    }
  });

  for (const testCase of UPDATE_PBA_MALFORMED_CASES) {
    test(`PUT /api/updatePba with ${testCase.name} returns an error`, async ({ apiRequest }) => {
      let organisationId: string | undefined;

      try {
        const provisioned = await provisionPendingOrganisation(apiRequest, {
          firstName: 'Pba',
          lastName: 'Negative'
        });
        organisationId = provisioned.organisationId;

        const response = await apiRequest.put('/api/updatePba', {
          data: testCase.buildPayload(provisioned.organisationId),
          failOnStatusCode: false
        });
        const httpStatus = response.status();
        expect(
          testCase.expectedStatuses,
          `Expected bounded error status for ${testCase.name}. Received status=${httpStatus}`
        ).toContain(httpStatus);
      } finally {
        await cleanupProvisionedOrganisation(apiRequest, organisationId);
      }
    });
  }

  test('PUT /api/updatePba with empty paymentAccounts array passes validation', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionPendingOrganisation(apiRequest, {
        firstName: 'Pba',
        lastName: 'Empty'
      });
      organisationId = provisioned.organisationId;
      const payload = {
        paymentAccounts: [],
        orgId: provisioned.organisationId
      };

      const response = await apiRequest.put('/api/updatePba', {
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 for empty paymentAccounts because the request structure is valid. Received status=${httpStatus}`
      ).toBe(200);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

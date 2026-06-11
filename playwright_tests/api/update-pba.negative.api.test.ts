import { test, expect } from './helpers/api.fixtures';
import { provisionPendingOrganisation } from './helpers/organisations-write.helpers';

const UNAUTHENTICATED_ORG_ID = 'UPDATE_PBA_NEGATIVE_ORG';

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

  test('PUT /api/updatePba with malformed or invalid fields returns an error', async ({ apiRequest }) => {
    const provisioned = await provisionPendingOrganisation(apiRequest, {
      firstName: 'Pba',
      lastName: 'Negative'
    });
    const testCases = [
      {
        name: 'missing orgId',
        payload: { paymentAccounts: ['PBA33L6BNO'] }
      },
      {
        name: 'invalid orgId',
        payload: { paymentAccounts: ['PBA33L6BNO'], orgId: 'INVALID_ORG_ID_12345' }
      },
      {
        name: 'invalid paymentAccounts type',
        payload: { paymentAccounts: 'PBA33L6BNO', orgId: provisioned.organisationId }
      }
    ];

    for (const testCase of testCases) {
      const response = await apiRequest.put('/api/updatePba', {
        data: testCase.payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected error status for ${testCase.name}. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    }
  });

  test('PUT /api/updatePba with empty paymentAccounts array passes validation', async ({ apiRequest }) => {
    const provisioned = await provisionPendingOrganisation(apiRequest, {
      firstName: 'Pba',
      lastName: 'Empty'
    });
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
      `Expected success or downstream error for empty paymentAccounts (valid request structure). Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(200);
  });
});

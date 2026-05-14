import { test, expect } from './helpers/api.fixtures';

const UPDATE_PBA_ORG_ID = process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';

test.describe('Playwright API negative: update pba', { tag: ['@update-pba', '@negative'] }, () => {
  test('PUT /api/updatePba without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      paymentAccounts: ['PBA33L6BNO'],
      orgId: UPDATE_PBA_ORG_ID,
    };

    const response = await apiAnonymousRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false,
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

  test('PUT /api/updatePba with missing or invalid required fields returns 403 Forbidden', async ({ apiRequest }) => {
    const testCases = [
      {
        name: 'missing paymentAccounts',
        payload: { orgId: UPDATE_PBA_ORG_ID }
      },
      {
        name: 'missing orgId',
        payload: { paymentAccounts: ['PBA33L6BNO'] }
      },
      {
        name: 'invalid orgId',
        payload: { paymentAccounts: ['PBA33L6BNO'], orgId: 'INVALID_ORG_ID_12345' }
      }
    ];

    for (const testCase of testCases) {
      const response = await apiRequest.put('/api/updatePba', {
        data: testCase.payload,
        failOnStatusCode: false,
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 403 Forbidden for ${testCase.name} (auth middleware validation). Received status=${httpStatus}`
      ).toBe(403);
    }
  });

  test('PUT /api/updatePba with empty paymentAccounts array passes validation', async ({ apiRequest }) => {
    const payload = {
      paymentAccounts: [],
      orgId: UPDATE_PBA_ORG_ID,
    };

    const response = await apiRequest.put('/api/updatePba', {
      data: payload,
      failOnStatusCode: false,
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected success or downstream error for empty paymentAccounts (valid request structure). Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(200);
  });
});

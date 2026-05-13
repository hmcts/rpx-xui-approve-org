import { test, expect } from './helpers/api.fixtures';

const UPDATE_PBA_ORG_ID = process.env.PW_API_UPDATE_PBA_ORG_ID || 'FHFS7IZ';

test.describe.skip('Playwright API negative: update pba status', () => {
  test('PUT /api/updatePba/status without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_ORG_ID,
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'PENDING' }]
    };

    const response = await apiAnonymousRequest.put('/api/updatePba/status', {
      data: payload,
      failOnStatusCode: false,
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated PUT /api/updatePba/status to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated update pba status request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated update pba status request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('PUT /api/updatePba/status with missing pbaNumbers returns error', async ({ apiRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_ORG_ID
    };

    const response = await apiRequest.put('/api/updatePba/status', {
      data: payload,
      failOnStatusCode: false,
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for missing pbaNumbers. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('PUT /api/updatePba/status with missing orgId returns error', async ({ apiRequest }) => {
    const payload = {
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'PENDING' }]
    };

    const response = await apiRequest.put('/api/updatePba/status', {
      data: payload,
      failOnStatusCode: false,
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for missing orgId. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('PUT /api/updatePba/status with invalid status value returns error', async ({ apiRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_ORG_ID,
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'INVALID_STATUS' }]
    };

    const response = await apiRequest.put('/api/updatePba/status', {
      data: payload,
      failOnStatusCode: false,
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for invalid status value. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });
});

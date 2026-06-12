import { test, expect } from './helpers/api.fixtures';

const UPDATE_PBA_TEST_ORG_ID = 'UPDATE_PBA_STATUS_TEST_ORG';
const PBA_STATUS_ENDPOINT = '/api/pba/status';

test.describe('Playwright API negative: update pba status', { tag: ['@update-pba-status', '@negative'] }, () => {
  test('PUT /api/pba/status without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_TEST_ORG_ID,
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'accepted', statusMessage: '' }]
    };

    const response = await apiAnonymousRequest.put(PBA_STATUS_ENDPOINT, {
      data: payload,
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated PUT ${PBA_STATUS_ENDPOINT} to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated pba status request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated pba status request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('PUT /api/pba/status with missing pbaNumbers returns error', async ({ apiRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_TEST_ORG_ID
    };

    const response = await apiRequest.put(PBA_STATUS_ENDPOINT, {
      data: payload,
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for missing pbaNumbers. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('PUT /api/pba/status with missing orgId returns error', async ({ apiRequest }) => {
    const payload = {
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'accepted', statusMessage: '' }]
    };

    const response = await apiRequest.put(PBA_STATUS_ENDPOINT, {
      data: payload,
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for missing orgId. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('PUT /api/pba/status with invalid status value returns error', async ({ apiRequest }) => {
    const payload = {
      orgId: UPDATE_PBA_TEST_ORG_ID,
      pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'INVALID_STATUS' }]
    };

    const response = await apiRequest.put(PBA_STATUS_ENDPOINT, {
      data: payload,
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for invalid status value. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });
});

import { test, expect } from './helpers/api.fixtures';

test.describe('Playwright API negative: pba status', { tag: ['@pba-status', '@negative'] }, () => {
  test('GET /api/pba/status/PENDING without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/pba/status/PENDING', { failOnStatusCode: false });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated GET /api/pba/status/PENDING to be denied. Received ok=${response.ok()} status=${httpStatus}`
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

  test('GET /api/pba/status/INVALID returns error or empty list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/pba/status/INVALID', { failOnStatusCode: false });
    const httpStatus = response.status();

    if (httpStatus === 200) {
      const payload = await response.json();
      expect(
        Array.isArray(payload),
        `Expected array payload from GET /api/pba/status/INVALID when status is 200. Received payloadType=${typeof payload}`
      ).toBe(true);
      expect(
        payload.length,
        `Expected empty payload for invalid status value. Received payloadLength=${payload.length}`
      ).toBe(0);
    } else {
      expect(
        httpStatus,
        `Expected error status for GET /api/pba/status/INVALID. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    }
  });
});

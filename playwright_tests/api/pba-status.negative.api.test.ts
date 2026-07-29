import { test, expect } from './helpers/api.fixtures';
import {
  createPbaSearchPayload,
  DENIED_HTTP_STATUSES,
  getXsrfHeaders
} from './helpers/search.helpers';

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

  test('POST /api/pba/status/PENDING without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.post('/api/pba/status/PENDING', {
      failOnStatusCode: false,
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber: 1,
        pageSize: 10,
        drillDownSearch: [{ field_name: 'pbaPendings', search_filter: 'PBA' }]
      })
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated POST /api/pba/status/PENDING search to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      DENIED_HTTP_STATUSES,
      `Expected denied status to be one of 302/401/403. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(location.toLowerCase()).toContain('login');
    }
  });

  test('POST /api/pba/status/PENDING with malformed payload returns an error', async ({ apiRequest }) => {
    const response = await apiRequest.post('/api/pba/status/PENDING', {
      failOnStatusCode: false,
      headers: {
        'content-type': 'application/json'
      },
      data: '{"view":"pending"'
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from malformed POST /api/pba/status/PENDING search payload. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/pba/status/PENDING with empty payload returns an error', async ({ apiRequest }) => {
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post('/api/pba/status/PENDING', {
      failOnStatusCode: false,
      headers: xsrfHeaders,
      data: {}
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 500 from POST /api/pba/status/PENDING with empty payload. Received status=${httpStatus}`
    ).toBe(500);
  });
});

import { test, expect } from './helpers/api.fixtures';

const ORGANISATION_ID = process.env.PW_API_ORGANISATION_ID || 'FWRJEOF';

test.describe('Playwright API negative: organisations by id', { tag: ['@organisations-by-id', '@negative'] }, () => {
  test('GET /api/organisations?organisationId=<id> without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/organisations', {
      params: {
        organisationId: ORGANISATION_ID
      },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated GET /api/organisations?organisationId=${ORGANISATION_ID} to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('GET /api/organisations?organisationId=INVALID returns error or empty', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations', {
      params: {
        organisationId: 'INVALID_ORG_ID_12345'
      },
      failOnStatusCode: false
    });
    const httpStatus = response.status();

    if (httpStatus === 200) {
      const payload = await response.json();
      expect(
        Array.isArray(payload) || typeof payload === 'object',
        `Expected array or object payload for invalid organisationId. Received payloadType=${typeof payload}`
      ).toBe(true);
      // If it returns a single object, it should be empty or null-like
      if (typeof payload === 'object' && !Array.isArray(payload)) {
        expect(
          Object.keys(payload).length,
          `Expected empty object for invalid organisationId. Received keys=${Object.keys(payload).join(',')}`
        ).toBe(0);
      }
    } else {
      expect(
        httpStatus,
        `Expected error status or 200 for invalid organisationId. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    }
  });

  test('GET /api/organisations?organisationId=<id>&version=INVALID returns 500 with 404 apiStatusCode', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations', {
      params: {
        organisationId: ORGANISATION_ID,
        version: 'v99'
      },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 500 from GET /api/organisations with invalid version. Received status=${httpStatus}`
    ).toBe(500);

    const payload = await response.json();
    expect(
      payload.apiStatusCode,
      `Expected apiStatusCode=404 in error response for invalid version. Received apiStatusCode=${payload?.apiStatusCode}`
    ).toBe(404);
    expect(
      payload.message,
      `Expected message property in error response. Received message=${payload?.message}`
    ).toBeTruthy();
  });

  test('GET /api/organisations?organisationId=<blank>&version=v2 returns 500 with 400 apiStatusCode', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations', {
      params: {
        organisationId: ' ',
        version: 'v2'
      },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 500 from GET /api/organisations with blank organisationId. Received status=${httpStatus}`
    ).toBe(500);

    const payload = await response.json();
    expect(
      payload.apiStatusCode,
      `Expected apiStatusCode=400 in error response for blank organisationId. Received apiStatusCode=${payload?.apiStatusCode}`
    ).toBe(400);
    expect(
      payload.message,
      `Expected handlePostOrganisationsRoute error message. Received message=${payload?.message}`
    ).toBe('handlePostOrganisationsRoute error');
  });
});

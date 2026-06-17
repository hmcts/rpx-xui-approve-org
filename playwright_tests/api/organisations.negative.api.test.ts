import { test, expect } from './helpers/api.fixtures';
import { searchEnvelopeShapeErrors } from './helpers/json-contracts';
import {
  createOrganisationSearchPayload,
  DENIED_HTTP_STATUSES
} from './helpers/search.helpers';

const statuses = ['PENDING', 'ACTIVE'];

test.describe('Playwright API negative: organisations', { tag: ['@organisations', '@negative'] }, () => {
  for (const status of statuses) {
    test(`GET /api/organisations?status=${status} without auth is denied`, async ({ apiAnonymousRequest }) => {
      const response = await apiAnonymousRequest.get(`/api/organisations?status=${status}`, { failOnStatusCode: false });
      const httpStatus = response.status();
      expect(
        response.ok(),
        `Expected unauthenticated request to be denied for status=${status}. Received ok=${response.ok()} status=${httpStatus}`
      ).toBe(false);
      expect(
        [302, 401, 403],
        `Expected denied status to be one of 302/401/403 for status=${status}. Received status=${httpStatus}`
      ).toContain(httpStatus);

      if (httpStatus === 302) {
        const location = response.headers().location ?? '';
        expect(
          location.toLowerCase(),
          `Expected redirect location to contain login for unauthenticated status=${status}. Received location=${location}`
        ).toContain('login');
      }
    });
  }

  test('POST /api/organisations?status=PENDING,REVIEW without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.post('/api/organisations?status=PENDING,REVIEW', {
      failOnStatusCode: false,
      data: createOrganisationSearchPayload({
        view: 'NEW',
        searchFilter: 'test',
        pageNumber: 1,
        pageSize: 10
      })
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated POST /api/organisations search to be denied. Received ok=${response.ok()} status=${httpStatus}`
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

  test('POST /api/organisations?status=PENDING,REVIEW with malformed payload returns an error', async ({ apiRequest }) => {
    const response = await apiRequest.post('/api/organisations?status=PENDING,REVIEW', {
      failOnStatusCode: false,
      headers: {
        'content-type': 'application/json'
      },
      data: '{"view":"NEW"'
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from malformed POST /api/organisations search payload. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/organisations?status=INVALID returns an error or valid empty envelope', async ({ apiRequest }) => {
    const response = await apiRequest.post('/api/organisations?status=INVALID', {
      failOnStatusCode: false,
      data: createOrganisationSearchPayload({
        view: 'ACTIVE',
        searchFilter: 'test',
        pageNumber: 1,
        pageSize: 10
      })
    });

    const httpStatus = response.status();

    if (httpStatus === 200) {
      const payload = await response.json();
      const shapeErrors = searchEnvelopeShapeErrors(payload);
      expect(
        shapeErrors,
        `Expected valid envelope when POST /api/organisations?status=INVALID returns 200. shapeErrors=${JSON.stringify(shapeErrors)}`
      ).toEqual([]);
    } else {
      expect(
        httpStatus,
        `Expected error status from POST /api/organisations?status=INVALID. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    }
  });
});

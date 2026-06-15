import { test, expect } from './helpers/api.fixtures';
import { organisationsListShapeErrors, resolveHeader, searchEnvelopeShapeErrors } from './helpers/json-contracts';
import {
  createOrganisationSearchPayload,
  getXsrfHeaders,
  isSearchPostAllowedStatus,
  toTotalRecordsNumber
} from './helpers/search.helpers';

const statuses = ['PENDING', 'ACTIVE', 'REVIEW', 'PENDING,REVIEW'] as const;

const organisationSearchScenarios = [
  {
    name: 'pending organisation search with search term',
    status: 'PENDING,REVIEW' as const,
    payload: createOrganisationSearchPayload({
      view: 'NEW',
      searchFilter: 'test',
      pageNumber: 1,
      pageSize: 10
    })
  },
  {
    name: 'active organisation search with empty search term',
    status: 'ACTIVE' as const,
    payload: createOrganisationSearchPayload({
      view: 'ACTIVE',
      searchFilter: '',
      pageNumber: 1,
      pageSize: 10
    })
  }
];

test.describe('Playwright API positive: organisations', { tag: ['@organisations', '@positive'] }, () => {
  for (const status of statuses) {
    test(`GET /api/organisations?status=${status} returns a JSON list`, async ({ apiRequest }) => {
      const response = await apiRequest.get(`/api/organisations?status=${status}`, { failOnStatusCode: false });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/organisations?status=${status}. Received status=${httpStatus}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for GET /api/organisations?status=${status}. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      const shapeErrors = organisationsListShapeErrors(payload);
      expect(
        shapeErrors,
        `Expected organisations payload shape to be valid for status=${status}. shapeErrors=${JSON.stringify(shapeErrors)}`
      ).toEqual([]);

      const firstOrganisation = Array.isArray(payload) ? payload[0] : undefined;
      if (firstOrganisation && typeof firstOrganisation === 'object') {
        expect(
          Object.keys(firstOrganisation),
          `Expected first organisation to include organisationIdentifier for status=${status}. keys=${Object.keys(firstOrganisation).join(',')}`
        ).toEqual(expect.arrayContaining(['organisationIdentifier']));
      }
    });
  }

  test('GET /api/organisations?status= returns a JSON list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations?status=', { failOnStatusCode: false });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/organisations?status=. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for GET /api/organisations?status=. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = organisationsListShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected organisations payload shape to be valid for blank status. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const firstOrganisation = Array.isArray(payload) ? payload[0] : undefined;
    if (firstOrganisation && typeof firstOrganisation === 'object') {
      expect(
        Object.keys(firstOrganisation),
        `Expected first organisation to include organisationIdentifier for blank status. keys=${Object.keys(firstOrganisation).join(',')}`
      ).toEqual(expect.arrayContaining(['organisationIdentifier']));
    }
  });

  for (const scenario of organisationSearchScenarios) {
    test(`POST /api/organisations search: ${scenario.name}`, async ({ apiRequest }) => {
      const xsrfHeaders = await getXsrfHeaders(apiRequest);
      const response = await apiRequest.post(`/api/organisations?status=${encodeURIComponent(scenario.status)}`, {
        failOnStatusCode: false,
        headers: xsrfHeaders,
        data: scenario.payload
      });

      const httpStatus = response.status();
      expect(
        isSearchPostAllowedStatus(httpStatus),
        `Expected POST /api/organisations?status=${scenario.status} to return 200. Received status=${httpStatus}`
      ).toBe(true);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for POST /api/organisations search. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      const shapeErrors = searchEnvelopeShapeErrors(payload);
      expect(
        shapeErrors,
        `Expected organisation search envelope shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
      ).toEqual([]);

      const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
      const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
      expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
      expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);

      const firstOrganisation = responsePayload.organisations[0] as Record<string, unknown> | undefined;
      if (firstOrganisation && typeof firstOrganisation === 'object') {
        expect(firstOrganisation).toHaveProperty('organisationIdentifier');
      }
    });
  }

  test('POST /api/organisations?status= returns a valid JSON envelope', async ({ apiRequest }) => {
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post('/api/organisations?status=', {
      failOnStatusCode: false,
      headers: xsrfHeaders,
      data: createOrganisationSearchPayload({
        view: 'ACTIVE',
        searchFilter: '',
        pageNumber: 1,
        pageSize: 10
      })
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from POST /api/organisations?status=. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for POST /api/organisations?status=. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = searchEnvelopeShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected organisation search envelope shape to be valid for blank status. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
    const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
    expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
    expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);

    const firstOrganisation = responsePayload.organisations[0] as Record<string, unknown> | undefined;
    if (firstOrganisation && typeof firstOrganisation === 'object') {
      expect(firstOrganisation).toHaveProperty('organisationIdentifier');
    }
  });
});

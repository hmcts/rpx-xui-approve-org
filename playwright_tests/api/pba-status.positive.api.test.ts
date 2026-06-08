import { test, expect } from './helpers/api.fixtures';
import { resolveHeader, searchEnvelopeShapeErrors } from './helpers/json-contracts';
import {
  createPbaSearchPayload,
  getXsrfHeaders,
  isSearchPostAllowedStatus,
  toTotalRecordsNumber
} from './helpers/search.helpers';

const statusValues = ['PENDING', 'ACCEPTED'] as const;
const searchStatus = 'PENDING' as const;

test.describe('Playwright API positive: pba status', { tag: ['@pba-status', '@positive'] }, () => {
  for (const statusValue of statusValues) {
    test(`GET /api/pba/status/${statusValue} returns a list`, async ({ apiRequest }) => {
      const response = await apiRequest.get(`/api/pba/status/${statusValue}`, { failOnStatusCode: false });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/pba/status/${statusValue}. Received status=${httpStatus}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type from GET /api/pba/status/${statusValue}. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      expect(
        Array.isArray(payload),
        `Expected array payload from GET /api/pba/status/${statusValue}. Received payloadType=${typeof payload}`
      ).toBe(true);

      if (payload.length > 0) {
        const firstItem = payload[0];
        expect(
          typeof firstItem,
          `Expected first item to be an object for status=${statusValue}. Received itemType=${typeof firstItem}`
        ).toBe('object');
        expect(
          firstItem,
          `Expected first item to include pbaNumbers for status=${statusValue}`
        ).toHaveProperty('pbaNumbers');
      }
    });
  }

  test('POST /api/pba/status/PENDING returns a search envelope or forbidden (drill-down search)', async ({ apiRequest }) => {
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post(`/api/pba/status/${searchStatus}`, {
      failOnStatusCode: false,
      headers: xsrfHeaders,
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber: 1,
        pageSize: 10,
        drillDownSearch: [{ field_name: 'pbaPendings', search_filter: 'PBA' }]
      })
    });

    const httpStatus = response.status();
    expect(
      isSearchPostAllowedStatus(httpStatus),
      `Expected POST /api/pba/status/${searchStatus} to return 200 or 403. Received status=${httpStatus}`
    ).toBe(true);

    if (httpStatus === 403) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected authenticated POST /api/pba/status/${searchStatus} not to redirect to login. location=${location}`
      ).not.toContain('login');
      return;
    }

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for POST /api/pba/status/${searchStatus}. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = searchEnvelopeShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected pba search envelope shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
    const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
    expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
    expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);

    const firstOrganisation = responsePayload.organisations[0] as Record<string, unknown> | undefined;
    if (firstOrganisation && typeof firstOrganisation === 'object') {
      expect(Object.keys(firstOrganisation).length).toBeGreaterThan(0);
    }
  });

  test('POST /api/pba/status/PENDING returns a search envelope or forbidden (without drill-down search)', async ({ apiRequest }) => {
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post(`/api/pba/status/${searchStatus}`, {
      failOnStatusCode: false,
      headers: xsrfHeaders,
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber: 1,
        pageSize: 10
      })
    });

    const httpStatus = response.status();
    expect(
      isSearchPostAllowedStatus(httpStatus),
      `Expected POST /api/pba/status/${searchStatus} to return 200 or 403. Received status=${httpStatus}`
    ).toBe(true);

    if (httpStatus === 403) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected authenticated POST /api/pba/status/${searchStatus} not to redirect to login. location=${location}`
      ).not.toContain('login');
      return;
    }

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for POST /api/pba/status/${searchStatus}. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = searchEnvelopeShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected pba search envelope shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
    const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
    expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
    expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);

    const firstOrganisation = responsePayload.organisations[0] as Record<string, unknown> | undefined;
    if (firstOrganisation && typeof firstOrganisation === 'object') {
      expect(Object.keys(firstOrganisation).length).toBeGreaterThan(0);
    }
  });
});

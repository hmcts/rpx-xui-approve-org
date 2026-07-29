import { test, expect } from './helpers/api.fixtures';
import { resolveHeader, searchEnvelopeShapeErrors } from './helpers/json-contracts';
import { getPbaStatusList } from './helpers/pba-status.helpers';
import {
  createPbaSearchPayload,
  getXsrfHeaders,
  isSearchPostAllowedStatus,
  toTotalRecordsNumber
} from './helpers/search.helpers';

const statusValues = ['PENDING', 'pending', 'ACCEPTED'] as const;
const searchStatus = 'pending' as const;

test.describe('Playwright API positive: pba status', { tag: ['@pba-status', '@positive'] }, () => {
  for (const statusValue of statusValues) {
    test(`GET /api/pba/status/${statusValue} returns a list`, async ({ apiRequest }) => {
      const result = await getPbaStatusList(apiRequest, statusValue);
      const httpStatus = result.httpStatus;
      expect(
        httpStatus,
        `Expected 200 from GET /api/pba/status/${statusValue}. Received status=${httpStatus} body=${result.rawBody}`
      ).toBe(200);

      expect(
        result.contentType,
        `Expected JSON content-type from GET /api/pba/status/${statusValue}. Received content-type=${result.contentType}`
      ).toContain('application/json');

      const payload = result.payload;
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

  test(`POST /api/pba/status/${searchStatus} returns a search envelope (drill-down search)`, async ({ apiRequest }) => {
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
      `Expected POST /api/pba/status/${searchStatus} to return 200. Received status=${httpStatus}`
    ).toBe(true);

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

  test(`POST /api/pba/status/${searchStatus} returns a search envelope (without drill-down search)`, async ({ apiRequest }) => {
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
      `Expected POST /api/pba/status/${searchStatus} to return 200. Received status=${httpStatus}`
    ).toBe(true);

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

  test(`POST /api/pba/status/${searchStatus} returns a paginated search envelope`, async ({ apiRequest }) => {
    const pageNumber = 2;
    const pageSize = 2;
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post(`/api/pba/status/${searchStatus}`, {
      failOnStatusCode: false,
      headers: xsrfHeaders,
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber,
        pageSize
      })
    });

    const httpStatus = response.status();
    expect(
      isSearchPostAllowedStatus(httpStatus),
      `Expected POST /api/pba/status/${searchStatus} with pageNumber=${pageNumber} pageSize=${pageSize} to return 200. Received status=${httpStatus}`
    ).toBe(true);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for paginated POST /api/pba/status/${searchStatus}. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = searchEnvelopeShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected paginated pba search envelope shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
    const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
    expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
    expect(
      responsePayload.organisations.length,
      `Expected returned organisations to respect pageSize=${pageSize}. Received count=${responsePayload.organisations.length}`
    ).toBeLessThanOrEqual(pageSize);
    expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);
  });

  test.skip('EXUI-4766 POST /api/pba/status without status returns a search envelope', async ({ apiRequest }) => {
    const xsrfHeaders = await getXsrfHeaders(apiRequest);
    const response = await apiRequest.post('/api/pba/status', {
      failOnStatusCode: false,
      headers: {
        ...xsrfHeaders,
        accept: 'application/json'
      },
      data: createPbaSearchPayload({
        searchFilter: 'active',
        pageNumber: 1,
        pageSize: 10
      })
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from POST /api/pba/status without status. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for POST /api/pba/status without status. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = searchEnvelopeShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected pba search envelope shape to be valid without status. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);

    const responsePayload = payload as { organisations: unknown[]; total_records: unknown };
    const totalRecords = toTotalRecordsNumber(responsePayload.total_records);
    expect(totalRecords, 'Expected total_records to be coercible to a finite number').not.toBeNull();
    expect(totalRecords as number).toBeGreaterThanOrEqual(responsePayload.organisations.length);
  });
});

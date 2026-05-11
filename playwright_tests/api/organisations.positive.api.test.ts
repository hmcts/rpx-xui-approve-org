import { test, expect } from './helpers/api.fixtures';
import { organisationsListShapeErrors, resolveHeader } from './helpers/json-contracts';

const statuses = ['PENDING', 'ACTIVE'];

test.describe('Playwright API positive: organisations', () => {
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
});

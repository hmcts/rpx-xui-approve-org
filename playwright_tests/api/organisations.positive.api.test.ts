import { test, expect } from './helpers/api.fixtures';
import { organisationsListShapeErrors, resolveHeader } from './helpers/json-contracts';

const statuses = ['PENDING', 'ACTIVE'];

test.describe('Playwright API positive: organisations', () => {
  for (const status of statuses) {
    test(`GET /api/organisations?status=${status} returns a JSON list`, async ({ apiRequest }) => {
      const response = await apiRequest.get(`/api/organisations?status=${status}`, { failOnStatusCode: false });
      expect(response.status()).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(contentType).toContain('application/json');

      const payload = await response.json();
      const shapeErrors = organisationsListShapeErrors(payload);
      expect(shapeErrors).toEqual([]);

      const firstOrganisation = Array.isArray(payload) ? payload[0] : undefined;
      if (firstOrganisation && typeof firstOrganisation === 'object') {
        expect(Object.keys(firstOrganisation)).toEqual(expect.arrayContaining(['organisationIdentifier']));
      }
    });
  }
});

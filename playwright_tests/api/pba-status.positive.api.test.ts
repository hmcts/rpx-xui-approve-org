import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const statusValues = ['PENDING', 'ACCEPTED'] as const;

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
});

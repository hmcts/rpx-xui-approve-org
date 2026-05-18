import { test, expect } from './helpers/api.fixtures';

const statuses = ['PENDING', 'ACTIVE'];

test.describe('Playwright API negative: organisations', () => {
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
});

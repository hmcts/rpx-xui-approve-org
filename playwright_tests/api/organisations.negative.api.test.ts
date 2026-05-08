import { test, expect } from './helpers/api.fixtures';

const statuses = ['PENDING', 'ACTIVE'];

test.describe('Playwright API negative: organisations', () => {
  for (const status of statuses) {
    test(`GET /api/organisations?status=${status} without auth is denied`, async ({ apiAnonymousRequest }) => {
      const response = await apiAnonymousRequest.get(`/api/organisations?status=${status}`, { failOnStatusCode: false });
      expect(response.ok()).toBe(false);
      expect([302, 401, 403]).toContain(response.status());

      if (response.status() === 302) {
        const location = response.headers().location ?? '';
        expect(location.toLowerCase()).toContain('login');
      }
    });
  }
});

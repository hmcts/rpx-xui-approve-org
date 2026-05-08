import { test, expect } from './helpers/api.fixtures';

test.describe('Playwright API negative: organisations', () => {
  test('GET /api/organisations?status=PENDING without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/organisations?status=PENDING', { failOnStatusCode: false });
    expect(response.ok()).toBe(false);
    expect([302, 401, 403]).toContain(response.status());

    if (response.status() === 302) {
      const location = response.headers().location ?? '';
      expect(location.toLowerCase()).toContain('login');
    }
  });

  test('GET /api/organisations?status=ACTIVE without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/organisations?status=ACTIVE', { failOnStatusCode: false });
    expect(response.ok()).toBe(false);
    expect([302, 401, 403]).toContain(response.status());

    if (response.status() === 302) {
      const location = response.headers().location ?? '';
      expect(location.toLowerCase()).toContain('login');
    }
  });
});

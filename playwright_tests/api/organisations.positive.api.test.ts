import { test, expect } from './helpers/api.fixtures';

test.describe('Playwright API positive: organisations', () => {
  test('GET /api/organisations?status=PENDING returns a JSON list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations?status=PENDING', { failOnStatusCode: false });
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');

    const payload = await response.json();
    expect(Array.isArray(payload)).toBe(true);

    if (payload.length > 0) {
      expect(payload[0]).toHaveProperty('organisationIdentifier');
    }
  });

  test('GET /api/organisations?status=ACTIVE returns a JSON list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations?status=ACTIVE', { failOnStatusCode: false });
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/json');

    const payload = await response.json();
    expect(Array.isArray(payload)).toBe(true);

    if (payload.length > 0) {
      expect(payload[0]).toHaveProperty('organisationIdentifier');
    }
  });
});

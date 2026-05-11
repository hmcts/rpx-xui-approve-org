import { test, expect } from './helpers/api.fixtures';

test.describe('Playwright API: organisations', () => {
  test('GET /api/organisations?status=PENDING returns a list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations?status=PENDING', { failOnStatusCode: false });
    const status = response.status();
    expect(status, `Expected 200 from GET /api/organisations?status=PENDING. Received status=${status}`).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(
      contentType,
      `Expected JSON content-type for GET /api/organisations?status=PENDING. Received content-type=${contentType}`
    ).toContain('application/json');
    const payload = await response.json();

    expect(
      Array.isArray(payload),
      `Expected array payload for GET /api/organisations?status=PENDING. Received payloadType=${typeof payload}`
    ).toBe(true);
    if (payload.length > 0) {
      expect(
        payload[0],
        `Expected first organisation item to include organisationIdentifier for status=PENDING. First item keys=${Object.keys(payload[0]).join(',')}`
      ).toHaveProperty('organisationIdentifier');
    }
  });

  test('GET /api/organisations?status=ACTIVE returns a list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/organisations?status=ACTIVE', { failOnStatusCode: false });
    const status = response.status();
    expect(status, `Expected 200 from GET /api/organisations?status=ACTIVE. Received status=${status}`).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(
      contentType,
      `Expected JSON content-type for GET /api/organisations?status=ACTIVE. Received content-type=${contentType}`
    ).toContain('application/json');
    const payload = await response.json();

    expect(
      Array.isArray(payload),
      `Expected array payload for GET /api/organisations?status=ACTIVE. Received payloadType=${typeof payload}`
    ).toBe(true);
    if (payload.length > 0) {
      expect(
        payload[0],
        `Expected first organisation item to include organisationIdentifier for status=ACTIVE. First item keys=${Object.keys(payload[0]).join(',')}`
      ).toHaveProperty('organisationIdentifier');
    }
  });
});

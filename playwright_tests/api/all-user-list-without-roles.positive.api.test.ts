import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';

test.describe('Playwright API positive: all user list without roles', () => {
  test('GET /api/allUserListWithoutRoles returns organisation user list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: USERS_ORG_ID },
      failOnStatusCode: false
    });
    expect(response.status()).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(contentType).toContain('application/json');

    const payload = await response.json();
    expect(typeof payload).toBe('object');
    expect(payload).toBeTruthy();
    expect(Array.isArray(payload.users)).toBe(true);

    if (Array.isArray(payload.users) && payload.users.length > 0) {
      expect(typeof payload.users[0]).toBe('object');
      if (payload.users[0]?.email !== undefined) {
        expect(typeof payload.users[0].email).toBe('string');
      }
      if (payload.users[0]?.idamStatus !== undefined) {
        expect(typeof payload.users[0].idamStatus).toBe('string');
      }
    }
  });
});

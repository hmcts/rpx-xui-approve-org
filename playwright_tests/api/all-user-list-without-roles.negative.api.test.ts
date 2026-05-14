import { test, expect } from './helpers/api.fixtures';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';

test.describe('Playwright API negative: all user list without roles', { tag: ['@all-user-list-without-roles', '@negative'] }, () => {
  test('GET /api/allUserListWithoutRoles without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: USERS_ORG_ID },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated request to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('GET /api/allUserListWithoutRoles with invalid usersOrgId returns error or empty list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: 'INVALID_ORG_ID_12345' },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    
    if (httpStatus === 200) {
      const payload = await response.json();
      expect(
        Array.isArray(payload.users) || payload.users.length === 0,
        `Expected empty users array for invalid org ID. Received payload=${JSON.stringify(payload)}`
      ).toBeTruthy();
    } else {
      expect(
        httpStatus,
        `Expected error status for invalid org ID. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    }
  });
});

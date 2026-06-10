import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';

test.describe('Playwright API positive: all user list without roles', { tag: ['@all-user-list-without-roles', '@positive'] }, () => {
  test('GET /api/allUserListWithoutRoles returns organisation user list', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: USERS_ORG_ID },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/allUserListWithoutRoles for usersOrgId=${USERS_ORG_ID}. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type from GET /api/allUserListWithoutRoles. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    expect(
      typeof payload,
      `Expected payload object from GET /api/allUserListWithoutRoles. Received payloadType=${typeof payload}`
    ).toBe('object');
    expect(payload, 'Expected non-empty payload from GET /api/allUserListWithoutRoles').toBeTruthy();
    expect(
      Array.isArray(payload.users),
      `Expected payload.users to be an array from GET /api/allUserListWithoutRoles. usersType=${typeof payload.users}`
    ).toBe(true);
    expect(
      payload.users.length,
      `Expected at least one user from GET /api/allUserListWithoutRoles for usersOrgId=${USERS_ORG_ID}. Received usersLength=${payload.users.length}`
    ).toBeGreaterThan(0);

    const firstUser = payload.users[0];
    expect(
      typeof firstUser,
      `Expected first user to be an object. Received firstUserType=${typeof firstUser}`
    ).toBe('object');
    if (firstUser?.email !== undefined) {
      expect(
        typeof firstUser.email,
        `Expected first user email to be a string when present. Received emailType=${typeof firstUser.email}`
      ).toBe('string');
    }
    if (firstUser?.idamStatus !== undefined) {
      expect(
        typeof firstUser.idamStatus,
        `Expected first user idamStatus to be a string when present. Received idamStatusType=${typeof firstUser.idamStatus}`
      ).toBe('string');
    }
  });
});

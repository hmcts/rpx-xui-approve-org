import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';
const EXPECTED_USER_EMAIL = (process.env.PW_API_EXPECTED_USER_EMAIL || '').trim();
const EXPECTED_USER_FIRST_NAME = process.env.PW_API_EXPECTED_USER_FIRST_NAME || 'Jason';
const EXPECTED_USER_LAST_NAME = process.env.PW_API_EXPECTED_USER_LAST_NAME || 'Lee';
const EXPECTED_USER_IDAM_STATUS = process.env.PW_API_EXPECTED_USER_IDAM_STATUS || 'ACTIVE';

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

  test('GET /api/allUserListWithoutRoles contains configured expected user details', async ({ apiRequest }) => {
    test.skip(!EXPECTED_USER_EMAIL, 'Set PW_API_EXPECTED_USER_EMAIL to verify deterministic user identity fields.');

    const response = await apiRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: USERS_ORG_ID },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/allUserListWithoutRoles for usersOrgId=${USERS_ORG_ID}. Received status=${httpStatus}`
    ).toBe(200);

    const payload = await response.json();
    expect(
      Array.isArray(payload.users),
      `Expected payload.users to be an array when validating expected user details for usersOrgId=${USERS_ORG_ID}.`
    ).toBe(true);

    const matchedUser = payload.users.find(
      (user: { email?: unknown }) =>
        typeof user.email === 'string' && user.email.toLowerCase() === EXPECTED_USER_EMAIL.toLowerCase()
    ) as { firstName?: unknown; lastName?: unknown; idamStatus?: unknown } | undefined;

    expect(
      matchedUser,
      `Expected to find a user with email=${EXPECTED_USER_EMAIL} in usersOrgId=${USERS_ORG_ID}.`
    ).toBeDefined();
    expect(
      matchedUser?.firstName,
      `Expected matched user firstName=${EXPECTED_USER_FIRST_NAME}. Received firstName=${JSON.stringify(matchedUser?.firstName)}`
    ).toBe(EXPECTED_USER_FIRST_NAME);
    expect(
      matchedUser?.lastName,
      `Expected matched user lastName=${EXPECTED_USER_LAST_NAME}. Received lastName=${JSON.stringify(matchedUser?.lastName)}`
    ).toBe(EXPECTED_USER_LAST_NAME);
    expect(
      matchedUser?.idamStatus,
      `Expected matched user idamStatus=${EXPECTED_USER_IDAM_STATUS}. Received idamStatus=${JSON.stringify(matchedUser?.idamStatus)}`
    ).toBe(EXPECTED_USER_IDAM_STATUS);
  });
});

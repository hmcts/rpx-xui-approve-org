import { test, expect } from './helpers/api.fixtures';
import {
  extractOrganisations,
  findUserByEmail,
  getOrganisationUserDetails,
  isOrganisationUser
} from './helpers/all-user-list-without-roles.helpers';
import { cleanupProvisionedOrganisation, provisionActiveOrganisation } from './helpers/organisations-write.helpers';
import { resolveHeader } from './helpers/json-contracts';

test.describe('Playwright API positive: all user list without roles', { tag: ['@all-user-list-without-roles', '@positive'] }, () => {
  test('GET /api/allUserListWithoutRoles returns organisation user list', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'List',
        lastName: 'Smoke'
      });
      organisationId = provisioned.organisationId;

      const response = await apiRequest.get('/api/allUserListWithoutRoles', {
        params: { usersOrgId: provisioned.organisationId },
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/allUserListWithoutRoles for usersOrgId=${provisioned.organisationId}. Received status=${httpStatus}`
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
        `Expected at least one user from GET /api/allUserListWithoutRoles for usersOrgId=${provisioned.organisationId}. Received usersLength=${payload.users.length}`
      ).toBeGreaterThan(0);

      const firstUser = findUserByEmail(payload.users, provisioned.workEmailAddress) ??
        (isOrganisationUser(payload.users[0]) ? payload.users[0] : undefined);
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
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('GET /api/allUserListWithoutRoles contains provisioned user details', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Listed',
        lastName: 'User'
      });
      organisationId = provisioned.organisationId;

      const response = await apiRequest.get('/api/allUserListWithoutRoles', {
        params: { usersOrgId: provisioned.organisationId },
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/allUserListWithoutRoles for usersOrgId=${provisioned.organisationId}. Received status=${httpStatus}`
      ).toBe(200);

      const payload = await response.json();
      expect(
        Array.isArray(payload.users),
        `Expected payload.users to be an array when validating expected user details for usersOrgId=${provisioned.organisationId}.`
      ).toBe(true);
      expect(payload.users.length, `Expected at least one user for usersOrgId=${provisioned.organisationId}.`).toBeGreaterThan(0);

      const matchedUser = findUserByEmail(payload.users, provisioned.workEmailAddress);

      expect(
        matchedUser,
        `Expected to find provisioned user email=${provisioned.workEmailAddress} in usersOrgId=${provisioned.organisationId}.`
      ).toBeDefined();
      expect(
        matchedUser?.firstName,
        `Expected matched user firstName=${provisioned.firstName}. Received firstName=${JSON.stringify(matchedUser?.firstName)}`
      ).toBe(provisioned.firstName);
      expect(
        matchedUser?.lastName,
        `Expected matched user lastName=${provisioned.lastName}. Received lastName=${JSON.stringify(matchedUser?.lastName)}`
      ).toBe(provisioned.lastName);
      if (matchedUser?.idamStatus !== undefined) {
        expect(typeof matchedUser.idamStatus, 'Expected matched user idamStatus to be a string when present').toBe('string');
      }
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('GET /api/allUserListWithoutRoles with no orgId returns all organisations with user details', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/allUserListWithoutRoles', {
      params: { usersOrgId: '' },
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/allUserListWithoutRoles with no usersOrgId. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type from GET /api/allUserListWithoutRoles with no usersOrgId. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const organisations = extractOrganisations(payload);
    expect(
      organisations.length,
      `Expected organisations list from GET /api/allUserListWithoutRoles with no usersOrgId. Received payload=${JSON.stringify(payload)}`
    ).toBeGreaterThan(0);

    const firstOrganisation = organisations[0];
    const organisationId = firstOrganisation.organisationIdentifier ?? firstOrganisation.organisationId;
    expect(
      typeof organisationId,
      `Expected first organisation to include an organisation id. organisation=${JSON.stringify(firstOrganisation)}`
    ).toBe('string');

    const organisationName = firstOrganisation.organisationName ?? firstOrganisation.name;
    if (organisationName !== undefined) {
      expect(
        typeof organisationName,
        `Expected first organisation name to be a string when present. organisation=${JSON.stringify(firstOrganisation)}`
      ).toBe('string');
    }

    const userDetails = getOrganisationUserDetails(firstOrganisation);
    expect(
      userDetails,
      `Expected first organisation to include user details. organisation=${JSON.stringify(firstOrganisation)}`
    ).toBeDefined();
    if (userDetails?.email !== undefined) {
      expect(
        typeof userDetails.email,
        `Expected organisation user email to be a string when present. user=${JSON.stringify(userDetails)}`
      ).toBe('string');
    }
    if (userDetails?.firstName !== undefined) {
      expect(
        typeof userDetails.firstName,
        `Expected organisation user firstName to be a string when present. user=${JSON.stringify(userDetails)}`
      ).toBe('string');
    }
    if (userDetails?.lastName !== undefined) {
      expect(
        typeof userDetails.lastName,
        `Expected organisation user lastName to be a string when present. user=${JSON.stringify(userDetails)}`
      ).toBe('string');
    }
  });
});

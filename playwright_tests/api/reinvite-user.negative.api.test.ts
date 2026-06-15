import { test, expect } from './helpers/api.fixtures';
import { cleanupProvisionedOrganisation, provisionActiveOrganisation } from './helpers/organisations-write.helpers';
import { createMissingReinviteEmail } from './helpers/reinvite-user.helpers';

const UNAUTHENTICATED_ORG_ID = 'UNAUTHENTICATED_REINVITE_ORG';
const UNAUTHENTICATED_EMAIL = createMissingReinviteEmail();

function parseJsonIfPresent(contentType: string, rawBody: string): unknown {
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

test.describe('Playwright API negative: reinvite user', { tag: ['@reinvite-user', '@negative'] }, () => {
  test('POST /api/reinviteUser without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: UNAUTHENTICATED_EMAIL,
      roles: ['pui-organisation-manager'],
      resendInvite: true
    };

    const response = await apiAnonymousRequest.post('/api/reinviteUser', {
      params: { organisationId: UNAUTHENTICATED_ORG_ID },
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated POST /api/reinviteUser to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated reinvite request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated reinvite request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('POST /api/reinviteUser with missing required fields returns error', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'MissingFields'
      });
      organisationId = provisioned.organisationId;
      const payload = {
        // Missing firstName, lastName, email, roles
        resendInvite: true
      };

      const response = await apiRequest.post('/api/reinviteUser', {
        params: { organisationId: provisioned.organisationId },
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected error status for missing required fields. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('POST /api/reinviteUser with empty payload returns error', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'EmptyPayload'
      });
      organisationId = provisioned.organisationId;

      const response = await apiRequest.post('/api/reinviteUser', {
        params: { organisationId: provisioned.organisationId },
        data: {},
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected error status for empty payload. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('POST /api/reinviteUser without organisationId parameter returns error', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'NoOrgId'
      });
      organisationId = provisioned.organisationId;
      const payload = {
        firstName: provisioned.firstName,
        lastName: provisioned.lastName,
        email: provisioned.workEmailAddress,
        roles: ['pui-organisation-manager'],
        resendInvite: true
      };

      const response = await apiRequest.post('/api/reinviteUser', {
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected error status when organisationId parameter is missing. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('POST /api/reinviteUser with invalid email format returns error', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'InvalidEmail'
      });
      organisationId = provisioned.organisationId;
      const payload = {
        firstName: 'Test',
        lastName: 'User',
        email: 'not-a-valid-email',
        roles: ['pui-organisation-manager'],
        resendInvite: true
      };

      const response = await apiRequest.post('/api/reinviteUser', {
        params: { organisationId: provisioned.organisationId },
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected error status for invalid email format. Received status=${httpStatus}`
      ).toBeGreaterThanOrEqual(400);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('POST /api/reinviteUser for provisioned-org user after registration returns throttled error', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'Throttled'
      });
      organisationId = provisioned.organisationId;
      const payload = {
        firstName: provisioned.firstName,
        lastName: provisioned.lastName,
        email: provisioned.workEmailAddress,
        roles: ['pui-organisation-manager'],
        resendInvite: true
      };

      const response = await apiRequest.post('/api/reinviteUser', {
        params: { organisationId: provisioned.organisationId },
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 429 for provisioned reinvite user email=${provisioned.workEmailAddress}. Received status=${httpStatus}`
      ).toBe(429);

      const contentType = response.headers()['content-type'] ?? '';
      const rawBody = await response.text();
      expect(typeof rawBody).toBe('string');

      const parsedBody = parseJsonIfPresent(contentType, rawBody);
      if (parsedBody && typeof parsedBody === 'object') {
        expect(parsedBody).toHaveProperty('apiStatusCode', 429);
        expect(parsedBody).toHaveProperty('apiError');
      }
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('POST /api/reinviteUser for missing provisioned-org user returns 404', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'MissingUser'
      });
      organisationId = provisioned.organisationId;
      const missingUserEmail = createMissingReinviteEmail();
      const payload = {
        firstName: 'Missing',
        lastName: 'User',
        email: missingUserEmail,
        roles: ['pui-organisation-manager'],
        resendInvite: true
      };

      const response = await apiRequest.post('/api/reinviteUser', {
        params: { organisationId: provisioned.organisationId },
        data: payload,
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 404 for non-existent reinvite user email=${missingUserEmail}. Received status=${httpStatus}`
      ).toBe(404);

      const contentType = response.headers()['content-type'] ?? '';
      const rawBody = await response.text();
      expect(typeof rawBody).toBe('string');

      const parsedBody = parseJsonIfPresent(contentType, rawBody);
      if (parsedBody && typeof parsedBody === 'object') {
        expect(parsedBody).toHaveProperty('apiStatusCode', 404);
        expect(parsedBody).toHaveProperty('apiError');
      }
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

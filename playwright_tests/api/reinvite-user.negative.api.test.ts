import { test, expect } from './helpers/api.fixtures';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';
const REINVITE_ORG_ID = process.env.PW_API_REINVITE_ORG_ID || USERS_ORG_ID;
const REINVITE_EMAIL = process.env.PW_API_REINVITE_EMAIL || 'vam.mun1752@mailnesia.com';
const REINVITE_MISSING_USER_EMAIL = (process.env.PW_API_REINVITE_MISSING_USER_EMAIL || '').trim();

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

test.describe.skip('Playwright API negative: reinvite user', { tag: ['@reinvite-user', '@negative'] }, () => {
  test('POST /api/reinviteUser without auth is denied', async ({ apiAnonymousRequest }) => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: REINVITE_EMAIL,
      roles: ['pui-organisation-manager'],
      resendInvite: true
    };

    const response = await apiAnonymousRequest.post('/api/reinviteUser', {
      params: { organisationId: REINVITE_ORG_ID },
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
    const payload = {
      // Missing firstName, lastName, email, roles
      resendInvite: true
    };

    const response = await apiRequest.post('/api/reinviteUser', {
      params: { organisationId: REINVITE_ORG_ID },
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for missing required fields. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/reinviteUser without organisationId parameter returns error', async ({ apiRequest }) => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: REINVITE_EMAIL,
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
  });

  test('POST /api/reinviteUser with invalid email format returns error', async ({ apiRequest }) => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'not-a-valid-email',
      roles: ['pui-organisation-manager'],
      resendInvite: true
    };

    const response = await apiRequest.post('/api/reinviteUser', {
      params: { organisationId: REINVITE_ORG_ID },
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status for invalid email format. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/reinviteUser for configured missing user returns 404', async ({ apiRequest }) => {
    test.skip(
      !REINVITE_MISSING_USER_EMAIL,
      'Set PW_API_REINVITE_MISSING_USER_EMAIL to validate missing-user error handling.'
    );

    const payload = {
      firstName: 'Missing',
      lastName: 'User',
      email: REINVITE_MISSING_USER_EMAIL,
      roles: ['pui-organisation-manager'],
      resendInvite: true
    };

    const response = await apiRequest.post('/api/reinviteUser', {
      params: { organisationId: REINVITE_ORG_ID },
      data: payload,
      failOnStatusCode: false
    });
    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 404 for non-existent reinvite user email=${REINVITE_MISSING_USER_EMAIL}. Received status=${httpStatus}`
    ).toBe(404);

    const contentType = response.headers()['content-type'] ?? '';
    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');

    const parsedBody = parseJsonIfPresent(contentType, rawBody);
    if (parsedBody && typeof parsedBody === 'object') {
      expect(parsedBody).toHaveProperty('apiStatusCode', 404);
      expect(parsedBody).toHaveProperty('apiError');
    }
  });
});

import { test, expect } from './helpers/api.fixtures';

const ORGANISATION_ID = process.env.PW_API_ORGANISATION_ID || 'FWRJEOF';

test.describe('Playwright API negative: organisations write', { tag: ['@organisations-write', '@negative'] }, () => {
  test('PUT /api/organisations/:id without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.put(`/api/organisations/${ORGANISATION_ID}`, {
      data: { organisationIdentifier: ORGANISATION_ID, status: 'ACTIVE' },
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated PUT /api/organisations/${ORGANISATION_ID} to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated organisation update request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated organisation update request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('DELETE /api/organisations/:id without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.delete(`/api/organisations/${ORGANISATION_ID}`, {
      data: {},
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated DELETE /api/organisations/${ORGANISATION_ID} to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated organisation delete request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated organisation delete request. Received location=${location}`
      ).toContain('login');
    }
  });

  test('PUT /api/organisations/:id with invalid id returns an error', async ({ apiRequest }) => {
    const invalidId = 'INVALID_ORG_ID_12345';
    const response = await apiRequest.put(`/api/organisations/${invalidId}`, {
      data: {
        organisationIdentifier: invalidId,
        status: 'ACTIVE'
      },
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from PUT /api/organisations/${invalidId}. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('DELETE /api/organisations/:id with invalid id returns an error', async ({ apiRequest }) => {
    const invalidId = 'INVALID_ORG_ID_12345';
    const response = await apiRequest.delete(`/api/organisations/${invalidId}`, {
      data: {},
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from DELETE /api/organisations/${invalidId}. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('PUT /api/organisations/:id with blank id returns an error', async ({ apiRequest }) => {
    const blankId = '%20';
    const response = await apiRequest.put(`/api/organisations/${blankId}`, {
      data: {
        organisationIdentifier: ORGANISATION_ID,
        status: 'ACTIVE'
      },
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from PUT /api/organisations/${blankId}. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });

  test('DELETE /api/organisations/:id with blank id returns an error', async ({ apiRequest }) => {
    const blankId = '%20';
    const response = await apiRequest.delete(`/api/organisations/${blankId}`, {
      data: {},
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected error status from DELETE /api/organisations/${blankId}. Received status=${httpStatus}`
    ).toBeGreaterThanOrEqual(400);
  });
});

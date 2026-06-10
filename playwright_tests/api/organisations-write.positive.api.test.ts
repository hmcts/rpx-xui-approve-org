import { test, expect } from './helpers/api.fixtures';
import {
  findDeletablePendingOrganisationId,
  loadOrganisationById,
  type OrganisationRecord
} from './helpers/organisations-write.helpers';

const APPROVE_ORG_ID = (process.env.APPROVE_ORG_API_APPROVE_ORG_ID ?? '').trim();
const DELETE_ORG_ID = (process.env.APPROVE_ORG_API_DELETE_ORG_ID ?? '').trim();
const DELETE_ACTIVE_ORG_ID = (process.env.APPROVE_ORG_API_DELETE_ACTIVE_ORG_ID ?? '').trim();

test.describe('Playwright API positive: organisations write', { tag: ['@organisations-write', '@positive'] }, () => {
  test('PUT /api/organisations/:id approves a pending organisation', async ({ apiRequest }) => {
    test.skip(!APPROVE_ORG_ID, 'Set APPROVE_ORG_API_APPROVE_ORG_ID to run pending organisation approval tests.');

    const sourceOrganisation = await loadOrganisationById(apiRequest, APPROVE_ORG_ID);
    const organisationId = APPROVE_ORG_ID;
    test.skip(!sourceOrganisation, `Unable to load organisation payload for id=${organisationId}.`);

    const updatePayload: OrganisationRecord = {
      ...sourceOrganisation,
      status: 'ACTIVE'
    };

    const response = await apiRequest.put(`/api/organisations/${organisationId}`, {
      data: updatePayload,
      failOnStatusCode: false
    });

    expect(
      response.status(),
      `Expected 200 from PUT /api/organisations/${organisationId} when APPROVE_ORG_API_APPROVE_ORG_ID is explicitly set. Received status=${response.status()}`
    ).toBe(200);
  });

  test('DELETE /api/organisations/:id deletes a deletable pending organisation', async ({ apiRequest }) => {
    const organisationId = await findDeletablePendingOrganisationId(apiRequest, {
      preferredOrganisationId: DELETE_ORG_ID
    });
    test.skip(!organisationId, 'No deletable pending organisation found. Set APPROVE_ORG_API_DELETE_ORG_ID to run against a known deletable org.');

    const response = await apiRequest.delete(`/api/organisations/${organisationId}`, {
      data: {},
      failOnStatusCode: false
    });

    expect(
      response.status(),
      `Expected 200 from DELETE /api/organisations/${organisationId}. Received status=${response.status()}`
    ).toBe(200);

    const rawBody = await response.text();
    expect(typeof rawBody, 'Expected delete route to return a serialised body or an empty string.').toBe('string');
  });

  test('DELETE /api/organisations/:id deletes a configured active organisation', async ({ apiRequest }) => {
    test.skip(
      !DELETE_ACTIVE_ORG_ID,
      'Set APPROVE_ORG_API_DELETE_ACTIVE_ORG_ID to run active organisation delete coverage.'
    );

    const response = await apiRequest.delete(`/api/organisations/${DELETE_ACTIVE_ORG_ID}`, {
      data: {},
      failOnStatusCode: false
    });

    expect(
      response.status(),
      `Expected 200 from DELETE /api/organisations/${DELETE_ACTIVE_ORG_ID}. Received status=${response.status()}`
    ).toBe(200);

    const rawBody = await response.text();
    expect(typeof rawBody, 'Expected delete route to return a serialised body or an empty string.').toBe('string');
  });
});

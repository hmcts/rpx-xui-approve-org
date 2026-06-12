import { test, expect } from './helpers/api.fixtures';
import {
  cleanupProvisionedOrganisation,
  loadOrganisationById,
  provisionPendingOrganisation,
  type OrganisationRecord
} from './helpers/organisations-write.helpers';

test.describe('Playwright API positive: organisations write', { tag: ['@organisations-write', '@positive'] }, () => {
  test('PUT /api/organisations/:id approves a pending organisation', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionPendingOrganisation(apiRequest);
      organisationId = provisioned.organisationId;
      const sourceOrganisation = await loadOrganisationById(apiRequest, organisationId);
      expect(sourceOrganisation, `Unable to load organisation payload for id=${organisationId}.`).toBeTruthy();

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
        `Expected 200 from PUT /api/organisations/${organisationId}. Received status=${response.status()}`
      ).toBe(200);
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('DELETE /api/organisations/:id deletes a deletable pending organisation', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionPendingOrganisation(apiRequest);
      organisationId = provisioned.organisationId;

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
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });

  test('DELETE /api/organisations/:id deletes an active organisation created by the test', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionPendingOrganisation(apiRequest);
      organisationId = provisioned.organisationId;
      const sourceOrganisation = await loadOrganisationById(apiRequest, provisioned.organisationId);
      expect(sourceOrganisation, `Unable to load organisation payload for id=${provisioned.organisationId}.`).toBeTruthy();

      const activateResponse = await apiRequest.put(`/api/organisations/${provisioned.organisationId}`, {
        data: {
          ...sourceOrganisation,
          status: 'ACTIVE'
        },
        failOnStatusCode: false
      });
      expect(
        activateResponse.status(),
        `Expected 200 from PUT /api/organisations/${provisioned.organisationId} during active-delete setup. Received status=${activateResponse.status()}`
      ).toBe(200);

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
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

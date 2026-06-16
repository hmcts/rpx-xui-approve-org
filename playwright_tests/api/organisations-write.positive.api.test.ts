import { test, expect } from './helpers/api.fixtures';
import {
  cleanupProvisionedOrganisation,
  loadOrganisationById,
  provisionActiveOrganisation,
  provisionPendingOrganisation
} from './helpers/organisations-write.helpers';
import { resolveHeader } from './helpers/json-contracts';

test.describe('Playwright API positive: organisations write', { tag: ['@organisations-write', '@positive'] }, () => {
  test('PUT /api/organisations/:id approves a pending organisation', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionPendingOrganisation(apiRequest);
      organisationId = provisioned.organisationId;
      const sourceOrganisation = await loadOrganisationById(apiRequest, organisationId);
      expect(sourceOrganisation, `Unable to load organisation payload for id=${organisationId}.`).toBeTruthy();

      const updatePayload = {
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

  test('GET /api/organisations/:id/isDeletable returns deletable status', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Delete',
        lastName: 'Status'
      });
      organisationId = provisioned.organisationId;

      const response = await apiRequest.get(`/api/organisations/${provisioned.organisationId}/isDeletable`, {
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/organisations/${provisioned.organisationId}/isDeletable. Received status=${httpStatus}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type from GET /api/organisations/${provisioned.organisationId}/isDeletable. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      expect(
        typeof payload,
        `Expected object payload from GET /api/organisations/${provisioned.organisationId}/isDeletable. Received payloadType=${typeof payload}`
      ).toBe('object');
      expect(
        Array.isArray(payload),
        `Expected deletable status payload to be an object, not an array. payload=${JSON.stringify(payload)}`
      ).toBe(false);
      expect(
        typeof payload.organisationDeletable,
        `Expected organisationDeletable boolean in response. payload=${JSON.stringify(payload)}`
      ).toBe('boolean');
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

import { test, expect } from './helpers/api.fixtures';
import { cleanupProvisionedOrganisation, provisionActiveOrganisation } from './helpers/organisations-write.helpers';
import { resolveHeader } from './helpers/json-contracts';

type ReinviteSuccessResponse = {
  apiError?: unknown;
  apiStatusCode?: unknown;
  message?: unknown;
};

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

test.describe('Playwright API positive: reinvite user', { tag: ['@reinvite-user', '@positive'] }, () => {
  test('POST /api/reinviteUser returns accepted response', async ({ apiRequest }) => {
    let organisationId: string | undefined;

    try {
      const provisioned = await provisionActiveOrganisation(apiRequest, {
        firstName: 'Reinvite',
        lastName: 'User'
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
      expect(response.status()).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      const rawBody = await response.text();
      expect(typeof rawBody).toBe('string');

      const parsedBody = parseJsonIfPresent(contentType, rawBody);
      expect(parsedBody, `Expected JSON success body from POST /api/reinviteUser. Received body=${rawBody}`).toBeTruthy();
      expect(typeof parsedBody, `Expected success body to be an object. Received body=${rawBody}`).toBe('object');

      const successBody = parsedBody as ReinviteSuccessResponse;
      expect(successBody).not.toHaveProperty('apiStatusCode');
      expect(successBody).not.toHaveProperty('apiError');
      expect(
        successBody.message,
        `Expected reinvite success body to include a string message. Received body=${rawBody}`
      ).toEqual(expect.any(String));
    } finally {
      await cleanupProvisionedOrganisation(apiRequest, organisationId);
    }
  });
});

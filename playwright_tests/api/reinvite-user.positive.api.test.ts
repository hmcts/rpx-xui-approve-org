import { test, expect } from './helpers/api.fixtures';
import { provisionActiveOrganisation } from './helpers/organisations-write.helpers';
import { resolveHeader } from './helpers/json-contracts';

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
  test('POST /api/reinviteUser returns accepted or already-invited response', async ({ apiRequest }) => {
    const provisioned = await provisionActiveOrganisation(apiRequest, {
      firstName: 'Reinvite',
      lastName: 'User'
    });

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
    expect([200, 429]).toContain(response.status());

    const contentType = resolveHeader(response.headers(), 'content-type');
    const rawBody = await response.text();
    expect(typeof rawBody).toBe('string');

    const parsedBody = parseJsonIfPresent(contentType, rawBody);
    if (parsedBody && typeof parsedBody === 'object' && response.status() === 429) {
      expect(parsedBody).toHaveProperty('apiStatusCode');
      expect(parsedBody).toHaveProperty('apiError');
    }
  });
});

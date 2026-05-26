import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const USERS_ORG_ID = process.env.PW_API_USERS_ORG_ID || '2GIHJH9';
const REINVITE_ORG_ID = process.env.PW_API_REINVITE_ORG_ID || USERS_ORG_ID;
const REINVITE_EMAIL = process.env.PW_API_REINVITE_EMAIL || 'vam.mun1752@mailnesia.com';

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

test.describe.skip('Playwright API positive: reinvite user', { tag: ['@reinvite-user', '@positive'] }, () => {
  test('POST /api/reinviteUser returns accepted or already-invited response', async ({ apiRequest }) => {
    const payload = {
      firstName: 'Vamshi',
      lastName: 'Muniganti',
      email: REINVITE_EMAIL,
      roles: ['pui-organisation-manager'],
      resendInvite: true
    };

    const response = await apiRequest.post('/api/reinviteUser', {
      params: { organisationId: REINVITE_ORG_ID },
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

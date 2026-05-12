import { test, expect } from './helpers/api.fixtures';
import { resolveHeader } from './helpers/json-contracts';

const ORGANISATION_ID = process.env.PW_API_ORGANISATION_ID || 'FWRJEOF';
const versions = ['v1', 'v2'] as const;

test.describe('Playwright API positive: organisations by id', () => {
  for (const version of versions) {
    test(`GET /api/organisations?organisationId=${ORGANISATION_ID}&version=${version} returns a single organisation`, async ({ apiRequest }) => {
      const response = await apiRequest.get('/api/organisations', {
        params: {
          organisationId: ORGANISATION_ID,
          version
        },
        failOnStatusCode: false
      });
      const httpStatus = response.status();
      expect(
        httpStatus,
        `Expected 200 from GET /api/organisations?organisationId=${ORGANISATION_ID}&version=${version}. Received status=${httpStatus}`
      ).toBe(200);

      const contentType = resolveHeader(response.headers(), 'content-type');
      expect(
        contentType,
        `Expected JSON content-type for GET /api/organisations?organisationId=${ORGANISATION_ID}&version=${version}. Received content-type=${contentType}`
      ).toContain('application/json');

      const payload = await response.json();
      expect(
        typeof payload,
        `Expected organisation object for organisationId=${ORGANISATION_ID}&version=${version}. Received payloadType=${typeof payload}`
      ).toBe('object');
      expect(
        Array.isArray(payload),
        `Expected single organisation object, not array, for organisationId=${ORGANISATION_ID}&version=${version}`
      ).toBe(false);

      expect(
        payload.organisationIdentifier,
        `Expected organisationIdentifier property in response for organisationId=${ORGANISATION_ID}. Received keys=${Object.keys(payload).join(',')}`
      ).toBeTruthy();
    });
  }
});

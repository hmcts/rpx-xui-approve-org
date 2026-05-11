import { test, expect } from './helpers/api.fixtures';
import { pbaAccountsMissingParameterErrors, resolveHeader } from './helpers/json-contracts';

const missingResponseError = {
  "apiError": "Account is missing",
  "apiStatusCode": "400",
  "message": "Fee And Pay route error"
}

test.describe('Playwright API negative: pba accounts', () => {
  test('GET /api/pbaAccounts without accountNames returns an error payload', async ({ apiRequest }) => {
    const response = await apiRequest.get('/api/pbaAccounts', { failOnStatusCode: false });
    const httpStatus = response.status();
    expect(httpStatus, `Expected 500 from GET /api/pbaAccounts without accountNames. Received status=${httpStatus}`).toBe(500);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type from GET /api/pbaAccounts without accountNames. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = pbaAccountsMissingParameterErrors(payload);
    expect(
      shapeErrors,
      `Expected missing-account payload shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);
    expect(
      payload,
      `Expected exact missing-account error payload. Received payload=${JSON.stringify(payload)}`
    ).toEqual(missingResponseError);
  });

  test('GET /api/pbaAccounts without auth is denied', async ({ apiAnonymousRequest }) => {
    const response = await apiAnonymousRequest.get('/api/pbaAccounts?accountNames=PBA1088483', { failOnStatusCode: false });
    const httpStatus = response.status();
    expect(
      response.ok(),
      `Expected unauthenticated GET /api/pbaAccounts to be denied. Received ok=${response.ok()} status=${httpStatus}`
    ).toBe(false);
    expect(
      [302, 401, 403],
      `Expected denied status to be one of 302/401/403 for unauthenticated pba accounts request. Received status=${httpStatus}`
    ).toContain(httpStatus);

    if (httpStatus === 302) {
      const location = response.headers().location ?? '';
      expect(
        location.toLowerCase(),
        `Expected redirect location to contain login for unauthenticated pba accounts request. Received location=${location}`
      ).toContain('login');
    }
  });

});

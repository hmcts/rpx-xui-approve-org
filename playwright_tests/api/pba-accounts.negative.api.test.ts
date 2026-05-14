import { test, expect } from './helpers/api.fixtures';
import { pbaAccountsMissingParameterErrors, resolveHeader } from './helpers/json-contracts';

const missingResponseError = {
  'apiError': 'Account is missing',
  'apiStatusCode': '400',
  'message': 'Fee And Pay route error'
};

test.describe('Playwright API negative: pba accounts', { tag: ['@pba-accounts', '@negative'] }, () => {
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

  test('GET /api/pbaAccounts without auth is denied', async ({ apiRequest, apiAnonymousRequest }) => {
    const statusResponse = await apiRequest.get('/api/pba/status/PENDING', { failOnStatusCode: false });
    expect(
      statusResponse.status(),
      `Expected 200 from GET /api/pba/status/PENDING to source a valid account for this test. Received status=${statusResponse.status()}`
    ).toBe(200);

    const statusPayload = await statusResponse.json();
    const accountName = Array.isArray(statusPayload)
      ? statusPayload
        .flatMap((org) => Array.isArray(org?.pbaNumbers) ? org.pbaNumbers : [])
        .map((pba) => pba?.pbaNumber)
        .find((pbaNumber) => typeof pbaNumber === 'string' && pbaNumber.length > 0)
      : undefined;

    expect(
      accountName,
      `Expected to resolve a valid pbaNumber from GET /api/pba/status/PENDING before calling /api/pbaAccounts. Payload=${JSON.stringify(statusPayload)}`
    ).toBeTruthy();

    const response = await apiAnonymousRequest.get('/api/pbaAccounts', {
      params: { accountNames: accountName },
      failOnStatusCode: false
    });
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

  test('GET /api/pbaAccounts with an invalid account returns a non-success account payload', async ({ apiRequest }) => {
    const invalidAccountName = 'PBA_INVALID_000000';

    const response = await apiRequest.get('/api/pbaAccounts', {
      params: { accountNames: invalidAccountName },
      failOnStatusCode: false
    });

    const httpStatus = response.status();
    expect(
      httpStatus,
      `Expected 200 from GET /api/pbaAccounts with invalid accountNames=${invalidAccountName}. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type from GET /api/pbaAccounts with invalid account. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    expect(
      Array.isArray(payload),
      `Expected array payload from GET /api/pbaAccounts with invalid account. Received payloadType=${typeof payload}`
    ).toBe(true);
    expect(
      payload.length,
      `Expected a single response item for invalid accountNames=${invalidAccountName}. Received payloadLength=${payload.length}`
    ).toBe(1);

    expect(
      payload[0],
      `Expected invalid account response marker account_name='not found'. Received item=${JSON.stringify(payload[0])}`
    ).toMatchObject({ account_name: 'not found' });
  });
});

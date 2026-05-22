import { test, expect } from '../helpers/integration.fixtures';
import { organisationsListShapeErrors, resolveHeader } from '../../api/helpers/json-contracts';

test.describe('Playwright integration seed: get active organisations', { tag: ['@integration', '@seed', '@read', '@organisations'] }, () => {
  test('GET /api/organisations?status=ACTIVE returns a valid JSON payload', async ({ integrationRequest }) => {
    const response = await integrationRequest.get('/api/organisations?status=ACTIVE', { failOnStatusCode: false });
    const httpStatus = response.status();

    expect(
      httpStatus,
      `Expected 200 for GET /api/organisations?status=ACTIVE. Received status=${httpStatus}`
    ).toBe(200);

    const contentType = resolveHeader(response.headers(), 'content-type');
    expect(
      contentType,
      `Expected JSON content-type for GET /api/organisations?status=ACTIVE. Received content-type=${contentType}`
    ).toContain('application/json');

    const payload = await response.json();
    const shapeErrors = organisationsListShapeErrors(payload);
    expect(
      shapeErrors,
      `Expected organisations payload shape to be valid. shapeErrors=${JSON.stringify(shapeErrors)}`
    ).toEqual([]);
  });
});

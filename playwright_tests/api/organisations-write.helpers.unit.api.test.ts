import { expect, test, type APIRequestContext } from '@playwright/test';

import { loadOrganisationById, registeredOrganisationId } from './helpers/organisations-write.helpers';

function fakeApiRequest(results: Array<number | Error>): APIRequestContext {
  let callCount = 0;

  return {
    get: async () => {
      const result = results[Math.min(callCount++, results.length - 1)];
      if (result instanceof Error) {
        throw result;
      }

      return {
        status: () => result,
        json: async () => ({ organisationIdentifier: 'ORG-123', status: 'PENDING' })
      };
    }
  } as unknown as APIRequestContext;
}

test.describe('organisation write helpers', () => {
  test('uses the identifier returned by registration without a pending-list lookup', () => {
    expect(registeredOrganisationId('  ORG-123  ')).toBe('ORG-123');
  });

  test('fails clearly when registration does not return an identifier', () => {
    expect(() => registeredOrganisationId(undefined)).toThrow('Registration completed without an organisationIdentifier.');
  });

  test('retries an aborted organisation read after provisioning', async () => {
    const organisation = await loadOrganisationById(
      fakeApiRequest([new Error('apiRequestContext.get: aborted'), 200]),
      'ORG-123',
      { attempts: 2, retryDelayMs: 0 }
    );

    expect(organisation).toMatchObject({ organisationIdentifier: 'ORG-123', status: 'PENDING' });
  });

  test('retries a transient gateway response but not a real missing organisation', async () => {
    const recoveredOrganisation = await loadOrganisationById(
      fakeApiRequest([502, 200]),
      'ORG-123',
      { attempts: 2, retryDelayMs: 0 }
    );
    const missingOrganisation = await loadOrganisationById(
      fakeApiRequest([404, 200]),
      'ORG-404',
      { attempts: 2, retryDelayMs: 0 }
    );

    expect(recoveredOrganisation).toMatchObject({ organisationIdentifier: 'ORG-123' });
    expect(missingOrganisation).toBeNull();
  });

  test('does not hide an unexpected request error', async () => {
    await expect(
      loadOrganisationById(
        fakeApiRequest([new Error('request configuration is invalid')]),
        'ORG-ERROR',
        { attempts: 2, retryDelayMs: 0 }
      )
    ).rejects.toThrow('request configuration is invalid');
  });
});

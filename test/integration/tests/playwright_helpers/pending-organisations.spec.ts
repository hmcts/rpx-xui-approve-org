import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import {
  findPendingOrganisation,
  findPendingOrganisationId,
  type PendingOrganisation,
} from '../../../../playwright_tests/helpers/pending-organisations';

describe('pending organisation helpers', () => {
  it('returns the organisation identifier for an exact organisation name match', () => {
    const organisations: PendingOrganisation[] = [
      { name: 'xui-ao-test-1-company-copy', organisationIdentifier: '999' },
      { name: 'xui-ao-test-1-company', organisationIdentifier: '123' },
    ];

    assert.equal(findPendingOrganisationId(organisations, 'xui-ao-test-1-company'), '123');
  });

  it('returns undefined when the matching organisation has no identifier yet', () => {
    const organisations: PendingOrganisation[] = [{ name: 'xui-ao-test-2-company' }];

    assert.equal(findPendingOrganisationId(organisations, 'xui-ao-test-2-company'), undefined);
  });

  it('returns the full matching organisation when present', () => {
    const organisations: PendingOrganisation[] = [
      { name: 'xui-ao-test-3-company', organisationIdentifier: '321', status: 'PENDING' },
    ];

    assert.deepEqual(findPendingOrganisation(organisations, 'xui-ao-test-3-company'), organisations[0]);
  });
});

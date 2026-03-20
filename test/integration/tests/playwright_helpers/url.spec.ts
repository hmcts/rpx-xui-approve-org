import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import { buildUrl } from '../../../../playwright_tests/helpers/url';

describe('buildUrl', () => {
  it('appends a relative path when the base URL has no trailing slash', () => {
    assert.equal(
      buildUrl('https://xui-ao-webapp-pr-1014.preview.platform.hmcts.net', 'api/environment/config'),
      'https://xui-ao-webapp-pr-1014.preview.platform.hmcts.net/api/environment/config'
    );
  });

  it('appends a relative path when the base URL already has a trailing slash', () => {
    assert.equal(
      buildUrl('https://administer-orgs.aat.platform.hmcts.net/', 'api/decisions/states/test/any/test/check'),
      'https://administer-orgs.aat.platform.hmcts.net/api/decisions/states/test/any/test/check'
    );
  });

  it('supports absolute paths for register URLs', () => {
    assert.equal(
      buildUrl('https://manage-org.aat.platform.hmcts.net', '/register-org-new/register'),
      'https://manage-org.aat.platform.hmcts.net/register-org-new/register'
    );
  });
});

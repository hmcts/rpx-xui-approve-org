import { strict as assert } from 'node:assert';
import type { Cookie } from 'playwright-core';

import { __test__ as sessionCaptureTest } from '../../../../playwright_tests_new/common/sessionCapture';

describe('sessionCapture', () => {
  const futureExpiry = Math.floor(Date.now() / 1000) + 3_600;

  const cookie = (name: string, overrides: Partial<Cookie> = {}): Cookie => ({
    name,
    value: 'test-value',
    domain: 'administer-orgs.aat.platform.hmcts.net',
    path: '/',
    expires: futureExpiry,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    ...overrides,
  });

  it('accepts an ao-webapp cookie as a compatible persisted app session', () => {
    assert.equal(
      sessionCaptureTest.hasCompatibleAuthCookie([cookie('ao-webapp')], 'https://administer-orgs.aat.platform.hmcts.net/'),
      true
    );
  });

  it('accepts a __auth__ cookie as a compatible persisted app session', () => {
    assert.equal(
      sessionCaptureTest.hasCompatibleAuthCookie([cookie('__auth__')], 'https://administer-orgs.aat.platform.hmcts.net/'),
      true
    );
  });

  it('does not require an Idam.Session cookie once an app session cookie is present', () => {
    assert.equal(sessionCaptureTest.hasDiagnosticAuthCookie([cookie('ao-webapp')]), false);
    assert.equal(
      sessionCaptureTest.hasCompatibleAuthCookie([cookie('ao-webapp')], 'https://administer-orgs.aat.platform.hmcts.net/'),
      true
    );
  });

  it('rejects Idam.Session on its own as an insufficient persisted app session', () => {
    assert.equal(
      sessionCaptureTest.hasCompatibleAuthCookie([cookie('Idam.Session')], 'https://administer-orgs.aat.platform.hmcts.net/'),
      false
    );
  });

  it('rejects expired primary auth cookies', () => {
    assert.equal(
      sessionCaptureTest.hasCompatibleAuthCookie(
        [cookie('ao-webapp', { expires: Math.floor(Date.now() / 1000) - 10 })],
        'https://administer-orgs.aat.platform.hmcts.net/'
      ),
      false
    );
  });
});

import * as path from 'node:path';
import * as dotenvExtended from 'dotenv-extended';

dotenvExtended.load({
  path: path.resolve(__dirname, '../../.env'),
  silent: true
});

const DEFAULT_TEST_URL = 'https://administer-orgs.aat.platform.hmcts.net/';
const DEFAULT_REGISTER_URL = 'https://manage-org.aat.platform.hmcts.net';

function resolveUrl(rawValue: string | undefined, fallback: string, envName: string): string {
  const value = (rawValue ?? '').trim();
  const candidate = value.length > 0 ? value : fallback;

  try {
    // Fail fast with a clear error instead of hitting page.goto("") later.
    new URL(candidate);
    return candidate;
  } catch {
    throw new Error(`Invalid ${envName} value: "${rawValue ?? ''}"`);
  }
}

function resolveCredential(envName: string): string {
  return (process.env[envName] ?? '').trim();
}

function resolveCredentialWithFallback(primaryEnvName: string, fallbackEnvNames: string[]): string {
  const primaryValue = resolveCredential(primaryEnvName);
  if (primaryValue.length > 0) {
    return primaryValue;
  }

  for (const fallbackEnvName of fallbackEnvNames) {
    const fallbackValue = resolveCredential(fallbackEnvName);
    if (fallbackValue.length > 0) {
      return fallbackValue;
    }
  }

  return '';
}

export const config = {
  baseUrl: resolveUrl(process.env.TEST_URL, DEFAULT_TEST_URL, 'TEST_URL'),
  registerUrl: resolveUrl(process.env.TEST_REGISTER_URL, DEFAULT_REGISTER_URL, 'TEST_REGISTER_URL'),
  base: {
    username: resolveCredentialWithFallback('APPROVE_ORG_ADMIN_USERNAME', ['TEST_EMAIL', 'TEST_API_EMAIL_ADMIN']),
    password: resolveCredentialWithFallback('APPROVE_ORG_ADMIN_PASSWORD', ['TEST_PASSWORD', 'TEST_API_PASSWORD_ADMIN'])
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};

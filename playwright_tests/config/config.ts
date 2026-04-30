const DEFAULT_TEST_URL = 'https://administer-orgs.aat.platform.hmcts.net/';
const DEFAULT_REGISTER_URL = 'https://manage-org.aat.platform.hmcts.net';
const DEFAULT_TEST_EMAIL = 'vamshiadminuser@mailnesia.com';
const DEFAULT_TEST_PASSWORD = 'Testing123';

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

function resolveCredential(rawValue: string | undefined, fallback: string, envName: string): string {
  const value = (rawValue ?? '').trim();
  if (value.length > 0) {
    return value;
  }

  const runningInCi =
    (process.env.CI ?? '').toLowerCase() === 'true' ||
    (process.env.JENKINS_URL ?? '').trim().length > 0;
  if (runningInCi) {
    console.warn(`[playwright-config] ${envName} is not set. Falling back to default test credential.`);
  }

  return fallback;
}

export const config = {
  baseUrl: resolveUrl(process.env.TEST_URL, DEFAULT_TEST_URL, 'TEST_URL'),
  registerUrl: resolveUrl(process.env.TEST_REGISTER_URL, DEFAULT_REGISTER_URL, 'TEST_REGISTER_URL'),
  base: {
    username: resolveCredential(process.env.TEST_EMAIL, DEFAULT_TEST_EMAIL, 'TEST_EMAIL'),
    password: resolveCredential(process.env.TEST_PASSWORD, DEFAULT_TEST_PASSWORD, 'TEST_PASSWORD')
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};

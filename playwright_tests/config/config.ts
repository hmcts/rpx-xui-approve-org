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

function resolveBaseCredentials(): { username: string; password: string } {
  const emailFromEnv = (process.env.TEST_EMAIL ?? '').trim();
  const passwordFromEnv = (process.env.TEST_PASSWORD ?? '').trim();

  // Only use CI-provided credentials when both are present.
  if (emailFromEnv.length > 0 && passwordFromEnv.length > 0) {
    return { username: emailFromEnv, password: passwordFromEnv };
  }

  // If only one env var is set, fall back to defaults to avoid mixed credentials.
  if (emailFromEnv.length > 0 || passwordFromEnv.length > 0) {
    console.warn('[playwright-config] Incomplete TEST_EMAIL/TEST_PASSWORD env vars. Falling back to default test credentials.');
  }

  return { username: DEFAULT_TEST_EMAIL, password: DEFAULT_TEST_PASSWORD };
}

const baseCredentials = resolveBaseCredentials();

export const config = {
  baseUrl: resolveUrl(process.env.TEST_URL, DEFAULT_TEST_URL, 'TEST_URL'),
  registerUrl: resolveUrl(process.env.TEST_REGISTER_URL, DEFAULT_REGISTER_URL, 'TEST_REGISTER_URL'),
  base: {
    username: baseCredentials.username,
    password: baseCredentials.password
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};

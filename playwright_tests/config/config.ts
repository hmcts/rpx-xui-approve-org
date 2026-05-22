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

function resolveCredential(primaryEnvName: string, fallbackEnvName?: string): string {
  const primaryValue = (process.env[primaryEnvName] ?? '').trim();
  if (primaryValue) {
    return primaryValue;
  }

  const fallbackValue = fallbackEnvName ? (process.env[fallbackEnvName] ?? '').trim() : '';
  if (fallbackValue) {
    return fallbackValue;
  }

  return '';
}

export const config = {
  baseUrl: resolveUrl(process.env.TEST_URL, DEFAULT_TEST_URL, 'TEST_URL'),
  registerUrl: resolveUrl(process.env.TEST_REGISTER_URL, DEFAULT_REGISTER_URL, 'TEST_REGISTER_URL'),
  base: {
    username: resolveCredential('TEST_API_EMAIL_ADMIN', 'TEST_EMAIL'),
    password: resolveCredential('TEST_API_PASSWORD_ADMIN', 'TEST_PASSWORD')
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};

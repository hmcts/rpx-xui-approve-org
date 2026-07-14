import * as path from 'node:path';
import * as dotenvExtended from 'dotenv-extended';

dotenvExtended.load({
  path: path.resolve(__dirname, '../../.env'),
  silent: true
});

const DEFAULT_TEST_URL = 'https://administer-orgs.aat.platform.hmcts.net/';
const DEFAULT_REGISTER_URL = 'https://manage-org.aat.platform.hmcts.net';
const REGISTER_URL_BY_ENVIRONMENT = {
  aat: DEFAULT_REGISTER_URL,
  demo: 'https://manage-org.demo.platform.hmcts.net',
  ithc: 'https://manage-org.ithc.platform.hmcts.net'
};
const HMCTS_APPROVE_ORG_HOST_PATTERN = /^(?:administer-orgs|xui-ao-webapp)(?:-(?:staging|pr-\d+))?\.(aat|demo|ithc|preview)\.platform\.hmcts\.net$/;

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

function resolveRegisterUrl(rawValue: string | undefined, baseUrl: string): string {
  const value = (rawValue ?? '').trim();
  if (value.length > 0) {
    return resolveUrl(value, DEFAULT_REGISTER_URL, 'TEST_REGISTER_URL');
  }

  const approveOrgHost = new URL(baseUrl).hostname.toLowerCase();
  const environment = HMCTS_APPROVE_ORG_HOST_PATTERN.exec(approveOrgHost)?.[1];
  if (environment === 'demo') {
    return REGISTER_URL_BY_ENVIRONMENT.demo;
  }
  if (environment === 'ithc') {
    return REGISTER_URL_BY_ENVIRONMENT.ithc;
  }

  return REGISTER_URL_BY_ENVIRONMENT.aat;
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

const baseUrl = resolveUrl(process.env.TEST_URL, DEFAULT_TEST_URL, 'TEST_URL');

export const config = {
  baseUrl,
  registerUrl: resolveRegisterUrl(process.env.TEST_REGISTER_URL, baseUrl),
  base: {
    username: resolveCredentialWithFallback('APPROVE_ORG_ADMIN_USERNAME', ['TEST_EMAIL', 'TEST_API_EMAIL_ADMIN']),
    password: resolveCredentialWithFallback('APPROVE_ORG_ADMIN_PASSWORD', ['TEST_PASSWORD', 'TEST_API_PASSWORD_ADMIN'])
  },
  api: {
    username: resolveCredential('APPROVE_ORG_API_USERNAME'),
    password: resolveCredential('APPROVE_ORG_API_PASSWORD')
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};

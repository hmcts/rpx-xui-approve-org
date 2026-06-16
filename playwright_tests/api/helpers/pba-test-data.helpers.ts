import { randomBytes } from 'node:crypto';
import { chromium, type APIRequestContext, type Browser, type Page } from '@playwright/test';
import { provisionPendingOrganisation } from './organisations-write.helpers';

export type PbaStatusTarget = {
  orgId: string;
  pbaNumbers: string[];
};

export type PbaUpdateTarget = {
  orgId: string;
  paymentAccounts: string[];
};

type ManageOrgCredentials = {
  username: string;
  password: string;
  source: string;
};

type ManageOrgOrganisationDetails = {
  organisationIdentifier?: unknown;
  status?: unknown;
  [key: string]: unknown;
};

const DEFAULT_MANAGE_ORG_AAT_URL = 'https://manage-org.aat.platform.hmcts.net/';
const MANAGE_ORG_SESSION_RETRIES = 5;

function generatePbaNumber(): string {
  const suffix = String(randomBytes(4).readUInt32BE(0) % 10000000).padStart(7, '0');
  return `PBA${suffix}`;
}

function generatePbaNumbers(count: number): string[] {
  const pbaNumbers = new Set<string>();

  while (pbaNumbers.size < count) {
    pbaNumbers.add(generatePbaNumber());
  }

  return Array.from(pbaNumbers);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveUrl(rawValue: string | undefined, fallback: string, envName: string): string {
  const candidate = (rawValue ?? '').trim() || fallback;
  try {
    return new URL(candidate).toString();
  } catch {
    throw new Error(`Invalid ${envName} value: "${rawValue ?? ''}"`);
  }
}

function resolveManageOrgSetupUrl(): string {
  return resolveUrl(
    process.env.PBA_SETUP_MANAGE_ORG_URL ?? process.env.MANAGE_ORG_TEST_URL,
    DEFAULT_MANAGE_ORG_AAT_URL,
    'PBA_SETUP_MANAGE_ORG_URL'
  );
}

function resolveCredentialPair(
  usernameEnvName: string,
  passwordEnvName: string,
  fallbackUsername: string,
  fallbackPassword: string
): ManageOrgCredentials | null {
  const username = (process.env[usernameEnvName] ?? fallbackUsername).trim();
  const password = (process.env[passwordEnvName] ?? fallbackPassword).trim();

  if (!username || !password) {
    return null;
  }

  return {
    username,
    password,
    source: `${usernameEnvName}/${passwordEnvName}`
  };
}

function resolveManageOrgCredentials(): ManageOrgCredentials {
  const credentialCandidates = [
    resolveCredentialPair('TEST_ROO_EMAIL', 'TEST_ROO_PASSWORD', '', '')
  ];
  const credentials = credentialCandidates.find((candidate): candidate is ManageOrgCredentials => candidate !== null);

  if (!credentials) {
    throw new Error(
      'Unable to create Manage Org pending PBA setup. ' +
      'Set the Manage Org Playwright user secrets TEST_ROO_EMAIL/TEST_ROO_PASSWORD.'
    );
  }

  return credentials;
}

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function hasManageOrgApiSession(page: Page, manageOrgUrl: string): Promise<boolean> {
  const response = await page.request.get(new URL('api/organisation/v1', manageOrgUrl).toString(), {
    failOnStatusCode: false
  }).catch(() => null);

  return response?.status() === 200;
}

async function waitForManageOrgApiSession(page: Page, manageOrgUrl: string): Promise<void> {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= MANAGE_ORG_SESSION_RETRIES; attempt += 1) {
    const response = await page.request.get(new URL('api/organisation/v1', manageOrgUrl).toString(), {
      failOnStatusCode: false
    }).catch(() => null);
    lastStatus = response?.status() ?? 0;

    if (lastStatus === 200) {
      return;
    }

    await sleep(1000 * attempt);
  }

  throw new Error(`Manage Org API session was not ready after login. Last status=${lastStatus}`);
}

async function fillVisibleLoginForm(page: Page, credentials: ManageOrgCredentials): Promise<boolean> {
  const namedUsernameInput = page.locator('input[name="username"]').first();
  const roleEmailInput = page.getByRole('textbox', { name: /Email address|Enter your work email address/i }).first();
  const fallbackEmailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  const usernameInput = await namedUsernameInput.isVisible().catch(() => false)
    ? namedUsernameInput
    : await roleEmailInput.isVisible().catch(() => false)
      ? roleEmailInput
      : fallbackEmailInput;

  if (!await usernameInput.isVisible().catch(() => false) || !await passwordInput.isVisible().catch(() => false)) {
    return false;
  }

  await usernameInput.fill(credentials.username);
  await passwordInput.fill(credentials.password);

  const legacySubmitButton = page.locator('#login-submit-btn').first();
  const redirectedToManageOrg = page.waitForURL((url) =>
    !url.hostname.includes('idam') &&
    !url.pathname.includes('/login'), { timeout: 30000 }
  ).catch(() => undefined);

  if (await legacySubmitButton.isVisible().catch(() => false)) {
    await legacySubmitButton.click();
  } else {
    await page.getByRole('button', { name: /sign in/i }).click();
  }

  await redirectedToManageOrg;
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);

  return true;
}

function isExpectedManageOrgRedirectInterruption(error: unknown, manageOrgUrl: string): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('interrupted by another navigation') && message.includes('idam')
  ) || (
    message.includes('net::ERR_ABORTED') && message.includes(manageOrgUrl)
  );
}

async function goToManageOrg(page: Page, manageOrgUrl: string): Promise<void> {
  try {
    await page.goto(manageOrgUrl, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    if (!isExpectedManageOrgRedirectInterruption(error, manageOrgUrl)) {
      throw error;
    }
  }

  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
}

async function signInToManageOrg(page: Page, manageOrgUrl: string, credentials: ManageOrgCredentials): Promise<void> {
  await goToManageOrg(page, manageOrgUrl);
  if (await hasManageOrgApiSession(page, manageOrgUrl)) {
    return;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const filledLoginForm = await fillVisibleLoginForm(page, credentials);
    if (!filledLoginForm) {
      await goToManageOrg(page, manageOrgUrl);
    }

    if (await hasManageOrgApiSession(page, manageOrgUrl)) {
      return;
    }

    await sleep(1000 * attempt);
  }

  throw new Error(
    `Unable to authenticate Manage Org setup user from ${credentials.source}. ` +
    `Current URL=${page.url()} title=${await page.title().catch(() => 'unknown')}`
  );
}

async function getXsrfToken(page: Page, manageOrgUrl: string): Promise<string> {
  const cookies = await page.context().cookies(manageOrgUrl);
  const xsrfToken = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value;

  if (!xsrfToken) {
    throw new Error(`Unable to resolve Manage Org XSRF token for ${manageOrgUrl}`);
  }

  return xsrfToken;
}

async function loadManageOrgOrganisationDetails(page: Page, manageOrgUrl: string): Promise<ManageOrgOrganisationDetails> {
  const response = await page.request.get(new URL('api/organisation/v1', manageOrgUrl).toString(), {
    failOnStatusCode: false
  });
  const rawBody = await response.text();

  if (response.status() !== 200) {
    throw new Error(
      `Unable to load Manage Org organisation details. Expected 200, received ${response.status()} body=${rawBody}`
    );
  }

  return JSON.parse(rawBody) as ManageOrgOrganisationDetails;
}

function extractOrganisationId(organisationDetails: ManageOrgOrganisationDetails): string {
  const organisationId = organisationDetails.organisationIdentifier;

  if (typeof organisationId !== 'string' || organisationId.trim() === '') {
    throw new Error(`Manage Org organisation details did not include organisationIdentifier=${String(organisationId)}`);
  }

  return organisationId;
}

async function addPendingPbasInManageOrg(page: Page, manageOrgUrl: string, pbaNumbers: string[]): Promise<void> {
  const xsrfToken = await getXsrfToken(page, manageOrgUrl);
  const origin = new URL(manageOrgUrl).origin;
  const response = await page.request.post(new URL('api/pba/addDeletePBA', manageOrgUrl).toString(), {
    data: {
      pendingPaymentAccount: {
        pendingAddPaymentAccount: pbaNumbers,
        pendingRemovePaymentAccount: []
      }
    },
    failOnStatusCode: false,
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      origin,
      referer: `${origin}/`,
      'x-xsrf-token': xsrfToken
    }
  });
  const rawBody = await response.text();

  if (response.status() !== 200) {
    throw new Error(
      'Unable to add pending PBAs in Manage Org. Expected 200 from POST api/pba/addDeletePBA, ' +
      `received ${response.status()} body=${rawBody}`
    );
  }
}

export async function resolvePbaUpdateTarget(apiRequest: APIRequestContext, paymentAccountCount: number): Promise<PbaUpdateTarget> {
  const provisioned = await provisionPendingOrganisation(apiRequest, {
    firstName: 'Pba',
    lastName: 'Setup'
  });

  return {
    orgId: provisioned.organisationId,
    paymentAccounts: generatePbaNumbers(paymentAccountCount)
  };
}

export async function resolvePbaStatusUpdateTarget(paymentAccountCount: number = 1): Promise<PbaStatusTarget> {
  const manageOrgUrl = resolveManageOrgSetupUrl();
  const credentials = resolveManageOrgCredentials();
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      baseURL: manageOrgUrl,
      ignoreHTTPSErrors: true
    });
    const page = await context.newPage();

    try {
      await signInToManageOrg(page, manageOrgUrl, credentials);
      await waitForManageOrgApiSession(page, manageOrgUrl);
      const organisationDetails = await loadManageOrgOrganisationDetails(page, manageOrgUrl);
      const orgId = extractOrganisationId(organisationDetails);
      const pbaNumbers = generatePbaNumbers(paymentAccountCount);

      await addPendingPbasInManageOrg(page, manageOrgUrl, pbaNumbers);

      return {
        orgId,
        pbaNumbers
      };
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

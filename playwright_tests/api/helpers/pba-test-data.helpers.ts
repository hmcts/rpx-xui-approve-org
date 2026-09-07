import { randomBytes } from 'node:crypto';
import { chromium, type APIRequestContext, type Browser, type Page } from '@playwright/test';
import { config } from '../../config/config';
import { completeIdamLogin } from '../../helpers/idamLogin';
import {
  loadOrganisationById,
  provisionPendingOrganisation
} from './organisations-write.helpers';

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
};

type ManageOrgOrganisationDetails = {
  organisationIdentifier?: unknown;
  paymentAccount?: unknown;
  pendingPaymentAccount?: unknown;
  status?: unknown;
};

const SHARED_REGISTER_ENVIRONMENT_KEYS = new Set([
  'hmcts:aat.platform.hmcts.net',
  'hmcts:demo.platform.hmcts.net'
]);
const HMCTS_SERVICE_HOST_PATTERN = /^(administer-orgs|xui-ao-webapp|manage-org)(?:-(staging)|-pr-(\d+))?\.(.+)$/;
const PREVIEW_APPROVE_ORG_HOST_PATTERN = /^xui-ao-webapp-pr-\d+\.preview\.platform\.hmcts\.net$/;
const MANAGE_ORG_URL = config.registerUrl.endsWith('/') ? config.registerUrl : `${config.registerUrl}/`;

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

function resolveManageOrgCredentials(): ManageOrgCredentials {
  const username = (process.env.TEST_ROO_EMAIL ?? '').trim();
  const password = (process.env.TEST_ROO_PASSWORD ?? '').trim();

  if (!username || !password) {
    throw new Error('Unable to setup pending PBAs. Set TEST_ROO_EMAIL and TEST_ROO_PASSWORD.');
  }

  return { username, password };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : [];
}

function resolveEnvironmentKey(rawUrl: string): string {
  const url = new URL(rawUrl);
  const host = url.hostname.toLowerCase();
  const hmctsServiceHost = HMCTS_SERVICE_HOST_PATTERN.exec(host);

  if (!hmctsServiceHost) {
    return url.origin.toLowerCase();
  }

  const [, , , previewPrNumber, environmentHost] = hmctsServiceHost;
  return previewPrNumber
    ? `hmcts:${environmentHost}:pr:${previewPrNumber}`
    : `hmcts:${environmentHost}`;
}

function resolveApproveOrgEnvironmentKey(manageOrgEnvironment: string): string {
  const approveOrgHost = new URL(config.baseUrl).hostname.toLowerCase();

  if (PREVIEW_APPROVE_ORG_HOST_PATTERN.test(approveOrgHost) && SHARED_REGISTER_ENVIRONMENT_KEYS.has(manageOrgEnvironment)) {
    return manageOrgEnvironment;
  }

  return resolveEnvironmentKey(config.baseUrl);
}

function assertManageOrgMatchesApproveOrgEnvironment(): void {
  const manageOrgEnvironment = resolveEnvironmentKey(MANAGE_ORG_URL);
  const approveOrgEnvironment = resolveApproveOrgEnvironmentKey(manageOrgEnvironment);

  if (approveOrgEnvironment !== manageOrgEnvironment) {
    throw new Error(
      'Unable to setup pending PBAs because approve-org and Manage Org target different environments. ' +
      `TEST_URL=${config.baseUrl} TEST_REGISTER_URL=${MANAGE_ORG_URL} ` +
      `approveOrgEnvironment=${approveOrgEnvironment} manageOrgEnvironment=${manageOrgEnvironment}`
    );
  }
}

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function hasManageOrgApiSession(page: Page): Promise<boolean> {
  const response = await page.request.get(new URL('api/organisation/v1', MANAGE_ORG_URL).toString(), {
    failOnStatusCode: false
  }).catch(() => null);

  return response?.status() === 200;
}

async function signInToManageOrg(page: Page, credentials: ManageOrgCredentials): Promise<void> {
  await page.goto(MANAGE_ORG_URL, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
  if (await hasManageOrgApiSession(page)) {
    return;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await completeIdamLogin(page, credentials.username, credentials.password).catch(async () => {
      await page.goto(MANAGE_ORG_URL, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    });

    if (await hasManageOrgApiSession(page)) {
      return;
    }

    await page.waitForTimeout(1000 * attempt);
  }

  throw new Error(`Unable to authenticate Manage Org setup user ${credentials.username}.`);
}

async function loadManageOrgOrganisationDetails(page: Page): Promise<ManageOrgOrganisationDetails> {
  const response = await page.request.get(new URL('api/organisation/v1', MANAGE_ORG_URL).toString(), {
    failOnStatusCode: false
  });
  const rawBody = await response.text();

  if (response.status() !== 200) {
    throw new Error(`Unable to load Manage Org organisation details. Expected 200, received ${response.status()} body=${rawBody}`);
  }

  return JSON.parse(rawBody) as ManageOrgOrganisationDetails;
}

function resolveOrganisationId(organisationDetails: ManageOrgOrganisationDetails): string {
  const organisationId = organisationDetails.organisationIdentifier;
  if (typeof organisationId !== 'string' || organisationId.trim() === '') {
    throw new Error(`Manage Org organisation details did not include organisationIdentifier=${String(organisationId)}`);
  }

  return organisationId;
}

async function postManageOrgPbaChanges(page: Page, pendingAddPaymentAccount: string[], pendingRemovePaymentAccount: string[]): Promise<void> {
  const cookies = await page.context().cookies(MANAGE_ORG_URL);
  const xsrfToken = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value;
  const origin = new URL(MANAGE_ORG_URL).origin;
  const response = await page.request.post(new URL('api/pba/addDeletePBA', MANAGE_ORG_URL).toString(), {
    data: {
      pendingPaymentAccount: {
        pendingAddPaymentAccount,
        pendingRemovePaymentAccount
      }
    },
    failOnStatusCode: false,
    headers: xsrfToken ? {
      origin,
      referer: MANAGE_ORG_URL,
      'X-XSRF-TOKEN': xsrfToken
    } : undefined
  });
  const rawBody = await response.text();

  if (![200, 202].includes(response.status())) {
    throw new Error(
      `Unable to update pending PBAs in Manage Org. Expected 200/202 from POST api/pba/addDeletePBA, received ${response.status()} body=${rawBody}`
    );
  }
}

async function withManageOrgPage<T>(action: (page: Page) => Promise<T>): Promise<T> {
  assertManageOrgMatchesApproveOrgEnvironment();
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      baseURL: MANAGE_ORG_URL,
      ignoreHTTPSErrors: true
    });

    try {
      const page = await context.newPage();
      await signInToManageOrg(page, resolveManageOrgCredentials());
      return await action(page);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
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

export async function resolvePbaStatusUpdateTarget(
  paymentAccountCount: number = 1
): Promise<PbaStatusTarget> {
  const pbaNumbers = generatePbaNumbers(paymentAccountCount);

  return withManageOrgPage(async (page) => {
    const organisationDetails = await loadManageOrgOrganisationDetails(page);
    const orgId = resolveOrganisationId(organisationDetails);

    await postManageOrgPbaChanges(page, pbaNumbers, []);
    return {
      orgId,
      pbaNumbers
    };
  });
}

export async function cleanupPbaStatusUpdateTarget(
  apiRequest: APIRequestContext,
  target: PbaStatusTarget
): Promise<void> {
  const targetPbas = new Set(target.pbaNumbers);
  const organisation = await loadOrganisationById(apiRequest, target.orgId);
  const paymentAccounts = asStringArray(organisation?.paymentAccount);
  const remainingPaymentAccounts = paymentAccounts.filter((paymentAccount) => !targetPbas.has(paymentAccount));

  if (paymentAccounts.length !== remainingPaymentAccounts.length) {
    const response = await apiRequest.put('/api/updatePba', {
      data: {
        orgId: target.orgId,
        paymentAccounts: remainingPaymentAccounts
      },
      failOnStatusCode: false
    });
    const rawBody = await response.text();

    if (response.status() !== 200) {
      throw new Error(`Unable to remove accepted test PBAs from orgId=${target.orgId}. Expected 200 from PUT /api/updatePba, received ${response.status()} body=${rawBody}`);
    }
  }

  await withManageOrgPage(async (page) => {
    const organisationDetails = await loadManageOrgOrganisationDetails(page);
    const orgId = resolveOrganisationId(organisationDetails);
    if (orgId !== target.orgId) {
      throw new Error(`Manage Org cleanup session resolved orgId=${orgId}, expected orgId=${target.orgId}.`);
    }

    const pendingPaymentAccounts = asStringArray(organisationDetails.pendingPaymentAccount);
    const pendingPbasToRemove = pendingPaymentAccounts.filter((paymentAccount) => targetPbas.has(paymentAccount));
    if (pendingPbasToRemove.length > 0) {
      await postManageOrgPbaChanges(page, [], pendingPbasToRemove);
    }
  });
}

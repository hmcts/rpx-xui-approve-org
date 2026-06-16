import { randomBytes } from 'node:crypto';
import { chromium, type APIRequestContext, type Browser, type Page } from '@playwright/test';
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

const MANAGE_ORG_AAT_URL = 'https://manage-org.aat.platform.hmcts.net/';

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

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function hasManageOrgApiSession(page: Page): Promise<boolean> {
  const response = await page.request.get(new URL('api/organisation/v1', MANAGE_ORG_AAT_URL).toString(), {
    failOnStatusCode: false
  }).catch(() => null);

  return response?.status() === 200;
}

async function signInToManageOrg(page: Page, credentials: ManageOrgCredentials): Promise<void> {
  await page.goto(MANAGE_ORG_AAT_URL, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
  if (await hasManageOrgApiSession(page)) {
    return;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const namedUsernameInput = page.locator('input[name="username"]').first();
    const emailInput = await namedUsernameInput.isVisible().catch(() => false)
      ? namedUsernameInput
      : page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    if (await emailInput.isVisible().catch(() => false) && await passwordInput.isVisible().catch(() => false)) {
      await emailInput.fill(credentials.username);
      await passwordInput.fill(credentials.password);

      const submitButton = page.locator('#login-submit-btn').first();
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
      } else {
        await page.getByRole('button', { name: /sign in/i }).click();
      }

      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    } else {
      await page.goto(MANAGE_ORG_AAT_URL, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }

    if (await hasManageOrgApiSession(page)) {
      return;
    }

    await page.waitForTimeout(1000 * attempt);
  }

  throw new Error(`Unable to authenticate Manage Org setup user ${credentials.username}.`);
}

async function loadManageOrgOrganisationDetails(page: Page): Promise<ManageOrgOrganisationDetails> {
  const response = await page.request.get(new URL('api/organisation/v1', MANAGE_ORG_AAT_URL).toString(), {
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
  const cookies = await page.context().cookies(MANAGE_ORG_AAT_URL);
  const xsrfToken = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value;
  const origin = new URL(MANAGE_ORG_AAT_URL).origin;
  const response = await page.request.post(new URL('api/pba/addDeletePBA', MANAGE_ORG_AAT_URL).toString(), {
    data: {
      pendingPaymentAccount: {
        pendingAddPaymentAccount,
        pendingRemovePaymentAccount
      }
    },
    failOnStatusCode: false,
    headers: xsrfToken ? {
      origin,
      referer: MANAGE_ORG_AAT_URL,
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
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      baseURL: MANAGE_ORG_AAT_URL,
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

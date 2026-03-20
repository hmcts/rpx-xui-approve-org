import { test as base, expect, chromium, type Page } from '@playwright/test';
import { config } from '../config/config';
import { signIn } from './login';
import { getAppBaseUrl, resolveAppUrl, resolveRegisterUrl } from './url';

const registrationStatePath = 'api/decisions/states/test/any/test/check';
const registrationModeEnvVar = 'PLAYWRIGHT_ORG_REGISTRATION_MODE';
const manageOrgRegistrationHosts = ['administer-orgs.aat.platform.hmcts.net'];
const registrationConfirmationTimeoutMs = 30_000;
const pendingOrganisationTimeoutMs = 30_000;
const pollingIntervalMs = 2_000;

type RegistrationMode = 'manage-org' | 'seed';

const delay = async (timeoutMs: number) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

const normalizeBaseUrlHost = () => new URL(config.baseUrl).host.toLowerCase();

const resolveRegistrationMode = (): RegistrationMode => {
  const explicitMode = process.env[registrationModeEnvVar]?.trim().toLowerCase();

  if (explicitMode) {
    if (explicitMode === 'manage-org' || explicitMode === 'seed') {
      return explicitMode;
    }

    throw new Error(`Unsupported ${registrationModeEnvVar} value: ${explicitMode}`);
  }

  return manageOrgRegistrationHosts.includes(normalizeBaseUrlHost()) ? 'manage-org' : 'seed';
};

const pollUntil = async (
  description: string,
  predicate: () => Promise<boolean>,
  timeoutMs: number = pendingOrganisationTimeoutMs
) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await predicate()) {
      return;
    }

    const remainingTimeMs = deadline - Date.now();
    if (remainingTimeMs > 0) {
      await delay(Math.min(pollingIntervalMs, remainingTimeMs));
    }
  }

  throw new Error(`${description} was not satisfied within ${timeoutMs}ms`);
};

const attachRegistrationDebug = async (
  page: Page,
  testInfo: { attach: (name: string, options: { body: Buffer, contentType: string }) => Promise<void> },
  error: unknown
) => {
  const title = await page.title().catch(() => 'unavailable');
  const bodyText = await page.locator('body').innerText().catch(() => 'unavailable');
  const screenshot = await page.screenshot({ fullPage: true }).catch(() => undefined);

  await testInfo.attach('register-org-debug', {
    body: Buffer.from([
      `URL: ${page.url()}`,
      `Title: ${title}`,
      `Registration mode: ${resolveRegistrationMode()}`,
      `Error: ${error instanceof Error ? error.message : String(error)}`,
      '',
      bodyText.slice(0, 4000)
    ].join('\n')),
    contentType: 'text/plain'
  });

  if (screenshot) {
    await testInfo.attach('register-org-debug-screenshot', {
      body: screenshot,
      contentType: 'image/png'
    });
  }
};

const getXsrfToken = async (page: Page) => {
  await page.context().request.get(resolveAppUrl('api/environment/config'));
  const cookies = await page.context().cookies(getAppBaseUrl());
  const xsrfCookie = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN');

  if (!xsrfCookie?.value) {
    throw new Error('Missing XSRF-TOKEN cookie after loading /api/environment/config');
  }

  return xsrfCookie.value;
};

const createPendingOrganisationViaManageOrg = async (page: Page, userName: string) => {
  await page.goto(resolveRegisterUrl('/register-org-new/register'));
  await page.getByLabel('I\'ve checked whether my organisation already has an account').click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByLabel('Solicitor').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Enter the name of the organisation').fill(`${userName}-company`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#postcodeInput').fill('EC1A 1BB');
  await page.getByRole('button', { name: 'Find address' }).click();
  await page.locator('#addressList').selectOption({
    label: 'Royal Mail, Mount Pleasant Mail Centre, Farringdon Road, London'
  });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('No').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#regulator-type0').selectOption({ label: 'Not Applicable' });
  await page.getByRole('button', { name: 'Continue' }).click();

  const damagesCheckbox = page.locator('input[data-service-label="Damages"]');
  await expect(damagesCheckbox).toBeVisible();
  await damagesCheckbox.check();

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('No').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('First name').fill('Test');
  await page.getByLabel('Last name').fill('User');
  await page.getByLabel('Enter your work email address').fill(`${userName}@mailinator.com`);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('No').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#confirm-terms-and-conditions').click();
  await page.getByRole('button', { name: 'Confirm and submit' }).click();

  const spinner = page.locator('div.spinner-wrapper');
  const registrationSubmittedHeading = page.getByRole('heading', { name: 'Registration details submitted' });

  await spinner.waitFor({ state: 'hidden', timeout: registrationConfirmationTimeoutMs });
  await pollUntil(
    'Registration details submitted heading',
    async () => registrationSubmittedHeading.isVisible().catch(() => false),
    registrationConfirmationTimeoutMs
  );
};

const createPendingOrganisation = async (page: Page, userName: string) => {
  const xsrfToken = await getXsrfToken(page);
  const response = await page.context().request.post(resolveAppUrl(registrationStatePath), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': xsrfToken
    },
    data: {
      event: 'continue',
      fromValues: {
        orgName: `${userName}-company`,
        officeAddressOne: 'Royal Mail, Mount Pleasant Mail Centre',
        officeAddressTwo: 'Farringdon Road',
        townOrCity: 'London',
        county: 'London',
        postcode: 'EC1A 1BB',
        PBAnumber1: '',
        PBAnumber2: '',
        firstName: 'Test',
        lastName: 'User',
        emailAddress: `${userName}@mailinator.com`
      }
    }
  });

  const bodyText = await response.text();
  if (!response.ok()) {
    throw new Error(`Organisation seed request failed with ${response.status()}: ${bodyText}`);
  }
};

const waitForPendingOrganisation = async (page: Page, userName: string) => {
  const expectedOrganisationName = `${userName}-company`;
  await pollUntil(
    `Seeded organisation ${expectedOrganisationName} appearing in the pending list`,
    async () => {
      await page.goto(config.baseUrl);
      await expect(page.getByRole('heading', { name: 'Organisation approvals' })).toBeVisible();
      await page.locator('#search').fill(userName);
      await page.getByRole('button', { name: 'Search' }).click();
      return page.getByText(expectedOrganisationName).first().isVisible().catch(() => false);
    },
    pendingOrganisationTimeoutMs
  );
};

export const test = base.extend<{
  userName: string;
}>({
  userName: [
    async ({ browserName }, use, testInfo) => {
      void browserName;
      const userName = `xui-ao-test-${Date.now().toString()}`;
      const ctx = await chromium.launchPersistentContext('', {
        headless: true
      });
      const page = await ctx.newPage();

      try {
        if (resolveRegistrationMode() === 'manage-org') {
          await createPendingOrganisationViaManageOrg(page, userName);
        } else {
          await signIn(page);
          await createPendingOrganisation(page, userName);
          await waitForPendingOrganisation(page, userName);
        }
      } catch (error) {
        await attachRegistrationDebug(page, testInfo, error);
        throw error;
      }

      await use(userName);
      await ctx.close();
    },
    { auto: true }
  ]
});

export { expect } from '@playwright/test';

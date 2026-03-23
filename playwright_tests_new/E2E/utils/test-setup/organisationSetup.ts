import { expect, type Page } from '@playwright/test';
import { getAppBaseUrl, resolveAppUrl, resolveRegisterUrl } from './appConfig';
import { signIn } from './auth';
import { findPendingOrganisationId, type PendingOrganisation } from './pendingOrganisations';
import { logger } from '../logger.utils';

const registrationStatePath = 'api/decisions/states/test/any/test/check';
const registrationModeEnvVar = 'PLAYWRIGHT_ORG_REGISTRATION_MODE';
const manageOrgRegistrationHosts = ['administer-orgs.aat.platform.hmcts.net'];
const registrationConfirmationTimeoutMs = parseInt(process.env.PLAYWRIGHT_REGISTRATION_CONFIRMATION_TIMEOUT_MS || '60000', 10);
const registrationSubmitRetries = parseInt(process.env.PLAYWRIGHT_REGISTRATION_SUBMIT_RETRIES || '8', 10);
const registrationSubmitRetryDelayMs = parseInt(process.env.PLAYWRIGHT_REGISTRATION_SUBMIT_RETRY_DELAY_MS || '5000', 10);
const defaultOrganisationStatusTimeoutMs = parseInt(process.env.PLAYWRIGHT_PENDING_ORG_TIMEOUT_MS || '120000', 10);
const pollingIntervalMs = 2_000;

type RegistrationMode = 'manage-org' | 'seed';

const delay = async (timeoutMs: number) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

const normalizeBaseUrlHost = () => new URL(getAppBaseUrl()).host.toLowerCase();

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

const pollUntil = async (description: string, predicate: () => Promise<boolean>, timeoutMs: number) => {
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

const isRetryableOrganisationSearchError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return [
    'SSL routines',
    'ECONNRESET',
    'socket hang up',
    'ERR_HTTP2',
    'Target page, context or browser has been closed',
    'Organisation search failed with 502',
    'Organisation search failed with 503',
    'Organisation search failed with 504',
  ].some((marker) => error.message.includes(marker));
};

export const buildOrganisationName = (userName: string) => `${userName}-company`;

export const getXsrfToken = async (page: Page) => {
  await page.context().request.get(resolveAppUrl('api/environment/config'));
  const cookies = await page.context().cookies(getAppBaseUrl());
  const xsrfCookie = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN');

  if (!xsrfCookie?.value) {
    throw new Error('Missing XSRF-TOKEN cookie after loading /api/environment/config');
  }

  return xsrfCookie.value;
};

const isVisible = async (locator: ReturnType<Page['locator']>) => locator.isVisible().catch(() => false);

const hasManageOrgServiceError = async (page: Page) => {
  const body = page.locator('body');
  const internalServerError = page.getByText('Internal Server Error', { exact: true });
  const serviceErrorSummary = page.getByText('Sorry, there is a problem with the service. Try again later', { exact: false });

  return (
    (await isVisible(internalServerError)) ||
    (await isVisible(serviceErrorSummary)) ||
    ((await body
      .getByText('There is a problem', { exact: false })
      .isVisible()
      .catch(() => false)) &&
      (await isVisible(serviceErrorSummary)))
  );
};

const waitForRegistrationSubmitted = async (page: Page) => {
  const spinner = page.locator('div.spinner-wrapper');
  const registrationSubmittedHeading = page.getByRole('heading', { name: 'Registration details submitted' });
  const deadline = Date.now() + registrationConfirmationTimeoutMs;

  while (Date.now() < deadline) {
    if (await isVisible(registrationSubmittedHeading)) {
      return true;
    }

    if (await hasManageOrgServiceError(page)) {
      return false;
    }

    if (await spinner.isVisible().catch(() => false)) {
      await page.waitForTimeout(1_000);
      continue;
    }

    await page.waitForTimeout(1_000);
  }

  return isVisible(registrationSubmittedHeading);
};

const submitManageOrgRegistration = async (page: Page) => {
  const confirmTerms = page.locator('#confirm-terms-and-conditions');
  const confirmAndSubmit = page.getByRole('button', { name: 'Confirm and submit' });

  for (let attempt = 1; attempt <= registrationSubmitRetries; attempt++) {
    if (!(await confirmTerms.isChecked().catch(() => false))) {
      await confirmTerms.check();
    }

    await confirmAndSubmit.click();

    if (await waitForRegistrationSubmitted(page)) {
      return;
    }

    if (attempt === registrationSubmitRetries) {
      break;
    }

    logger.warn('Transient manage-org submission error detected, refreshing and retrying', {
      attempt,
      registrationSubmitRetries,
      currentUrl: page.url(),
    });
    await page.waitForTimeout(registrationSubmitRetryDelayMs);
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  logger.warn('Registration details submitted heading was not visible after submit retries; continuing to backend status check', {
    registrationConfirmationTimeoutMs,
    registrationSubmitRetries,
    currentUrl: page.url(),
  });
  return false;
};

const createPendingOrganisationViaManageOrg = async (page: Page, userName: string) => {
  await page.goto(resolveRegisterUrl('/register-org-new/register'));
  await page.getByLabel("I've checked whether my organisation already has an account").click();
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByLabel('Solicitor').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Enter the name of the organisation').fill(buildOrganisationName(userName));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#postcodeInput').fill('EC1A 1BB');
  await page.getByRole('button', { name: 'Find address' }).click();
  await page.locator('#addressList').selectOption({
    label: 'Royal Mail, Mount Pleasant Mail Centre, Farringdon Road, London',
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
  await submitManageOrgRegistration(page);
};

const createPendingOrganisationViaSeed = async (page: Page, userName: string) => {
  const xsrfToken = await getXsrfToken(page);
  const response = await page.context().request.post(resolveAppUrl(registrationStatePath), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': xsrfToken,
    },
    data: {
      event: 'continue',
      fromValues: {
        orgName: buildOrganisationName(userName),
        officeAddressOne: 'Royal Mail, Mount Pleasant Mail Centre',
        officeAddressTwo: 'Farringdon Road',
        townOrCity: 'London',
        county: 'London',
        postcode: 'EC1A 1BB',
        PBAnumber1: '',
        PBAnumber2: '',
        firstName: 'Test',
        lastName: 'User',
        emailAddress: `${userName}@mailinator.com`,
      },
    },
  });

  const bodyText = await response.text();
  if (!response.ok()) {
    throw new Error(`Organisation seed request failed with ${response.status()}: ${bodyText}`);
  }
};

export const seedPendingOrganisation = async (page: Page, userName: string) => {
  const registrationMode = resolveRegistrationMode();
  logger.info('Seeding pending organisation for workflow test', { userName, registrationMode });

  if (registrationMode === 'manage-org') {
    await createPendingOrganisationViaManageOrg(page, userName);
    await signIn(page);
    return;
  }

  await signIn(page);
  await createPendingOrganisationViaSeed(page, userName);
};

export const searchOrganisations = async (
  page: Page,
  searchFilter: string,
  statuses: string,
  xsrfToken?: string
): Promise<PendingOrganisation[]> => {
  const effectiveXsrfToken = xsrfToken ?? (await getXsrfToken(page));
  const response = await page.context().request.post(resolveAppUrl(`api/organisations?status=${statuses}`), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': effectiveXsrfToken,
    },
    data: {
      searchRequest: {
        search_filter: searchFilter,
        sorting_parameters: [
          {
            sort_by: 'organisationId',
            sort_order: 'ASC',
          },
        ],
        pagination_parameters: {
          page_number: 1,
          page_size: 10,
        },
      },
      view: 'NEW',
    },
  });

  const bodyText = await response.text();
  if (!response.ok()) {
    throw new Error(`Organisation search failed with ${response.status()}: ${bodyText}`);
  }

  const responseData = JSON.parse(bodyText);
  return Array.isArray(responseData?.organisations) ? responseData.organisations : [];
};

export const waitForOrganisationStatus = async (
  page: Page,
  organisationName: string,
  statuses: string,
  timeoutMs: number = defaultOrganisationStatusTimeoutMs
) => {
  let matchedOrganisationId = '';

  await pollUntil(
    `Organisation ${organisationName} appearing in ${statuses}`,
    async () => {
      try {
        const organisations = await searchOrganisations(page, organisationName, statuses);
        const organisationId = findPendingOrganisationId(organisations, organisationName);
        if (!organisationId) {
          return false;
        }

        matchedOrganisationId = organisationId;
        logger.info('Resolved organisation status from backend', {
          organisationName,
          statuses,
          matchedOrganisationId,
        });
        return true;
      } catch (error) {
        if (isRetryableOrganisationSearchError(error)) {
          logger.warn('Transient organisation search error while waiting for status', {
            organisationName,
            statuses,
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        }

        throw error;
      }
    },
    timeoutMs
  );

  if (!matchedOrganisationId) {
    throw new Error(`Organisation ${organisationName} did not return an organisationIdentifier for statuses ${statuses}`);
  }

  return matchedOrganisationId;
};

export const waitForAnyOrganisationStatus = async (
  page: Page,
  statuses: string,
  timeoutMs: number = defaultOrganisationStatusTimeoutMs
) => {
  let matchedOrganisation: PendingOrganisation | null = null;

  await pollUntil(
    `Any organisation appearing in ${statuses}`,
    async () => {
      try {
        const organisations = await searchOrganisations(page, '', statuses);
        matchedOrganisation = organisations.find((organisation) => Boolean(organisation.organisationIdentifier)) ?? null;
        if (matchedOrganisation?.organisationIdentifier) {
          logger.info('Resolved organisation from backend status search', {
            statuses,
            organisationIdentifier: matchedOrganisation.organisationIdentifier,
            organisationName: matchedOrganisation.name,
          });
        }
        return Boolean(matchedOrganisation?.organisationIdentifier);
      } catch (error) {
        if (isRetryableOrganisationSearchError(error)) {
          logger.warn('Transient organisation search error while waiting for any organisation status', {
            statuses,
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        }

        throw error;
      }
    },
    timeoutMs
  );

  if (!matchedOrganisation?.organisationIdentifier) {
    throw new Error(`No organisation with an identifier was returned for statuses ${statuses}`);
  }

  return matchedOrganisation;
};

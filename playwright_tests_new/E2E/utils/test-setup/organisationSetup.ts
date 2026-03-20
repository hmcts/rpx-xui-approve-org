import type { Page } from '@playwright/test';
import { findPendingOrganisationId, type PendingOrganisation } from '../../../../playwright_tests/helpers/pending-organisations';
import { getAppBaseUrl, resolveAppUrl } from '../../../../playwright_tests/helpers/url';

const registrationStatePath = 'api/decisions/states/test/any/test/check';
const defaultOrganisationStatusTimeoutMs = parseInt(process.env.PLAYWRIGHT_PENDING_ORG_TIMEOUT_MS || '120000', 10);
const pollingIntervalMs = 2_000;

const delay = async (timeoutMs: number) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

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

export const seedPendingOrganisation = async (page: Page, userName: string) => {
  const xsrfToken = await getXsrfToken(page);
  const response = await page.context().request.post(resolveAppUrl(registrationStatePath), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': xsrfToken
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
        emailAddress: `${userName}@mailinator.com`
      }
    }
  });

  const bodyText = await response.text();
  if (!response.ok()) {
    throw new Error(`Organisation seed request failed with ${response.status()}: ${bodyText}`);
  }
};

export const searchOrganisations = async (
  page: Page,
  searchFilter: string,
  statuses: string,
  xsrfToken?: string
): Promise<PendingOrganisation[]> => {
  const effectiveXsrfToken = xsrfToken ?? await getXsrfToken(page);
  const response = await page.context().request.post(resolveAppUrl(`api/organisations?status=${statuses}`), {
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': effectiveXsrfToken
    },
    data: {
      searchRequest: {
        search_filter: searchFilter,
        sorting_parameters: [{
          sort_by: 'organisationId',
          sort_order: 'ASC'
        }],
        pagination_parameters: {
          page_number: 1,
          page_size: 10
        }
      },
      view: 'NEW'
    }
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
  const xsrfToken = await getXsrfToken(page);
  let matchedOrganisationId = '';

  await pollUntil(
    `Organisation ${organisationName} appearing in ${statuses}`,
    async () => {
      const organisations = await searchOrganisations(page, organisationName, statuses, xsrfToken);
      const organisationId = findPendingOrganisationId(organisations, organisationName);
      if (!organisationId) {
        return false;
      }

      matchedOrganisationId = organisationId;
      return true;
    },
    timeoutMs
  );

  if (!matchedOrganisationId) {
    throw new Error(`Organisation ${organisationName} did not return an organisationIdentifier for statuses ${statuses}`);
  }

  return matchedOrganisationId;
};

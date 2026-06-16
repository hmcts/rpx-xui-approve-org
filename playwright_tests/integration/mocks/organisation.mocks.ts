import { expect, type Page, type Request, type Response, type Route } from '@playwright/test';
import { paginateMockItems } from './pagination.mocks';

export const PENDING_ORGANISATIONS_TABLE_SELECTOR = 'table.pending-organisations';
export const ACTIVE_ORGANISATIONS_TABLE_SELECTOR = 'table.active-organisations';

export type MockOrganisation = {
  organisationIdentifier: string;
  name: string;
  status: string;
  companyNumber: string;
  orgType: string;
  sraId: string;
  contactInformation: Array<{
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    townCity: string;
    county: string;
    postCode: string;
    dxAddress: Array<{ dxNumber: string; dxExchange: string }>;
  }>;
  superUser: {
    userIdentifier: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentAccount: string[];
  pendingPaymentAccount: string[];
  orgAttributes: Array<{ key: string; value: string }>;
};

export type CommonOrganisationApiMockState = {
  activeOrganisations?: MockOrganisation[];
  pendingOrganisations?: MockOrganisation[];
  singleOrganisationsById?: Record<string, MockOrganisation>;
  activeSearchResponse?: SearchResponseOverride;
  pendingSearchResponse?: SearchResponseOverride;
};

type SearchResponseOverride = {
  status?: number;
  body?: unknown;
  onlyWhenSearchTermPresent?: boolean;
};

export type OrganisationSearchApiRequestPayload = {
  view?: string;
  searchRequest?: {
    search_filter?: string;
    sorting_parameters?: Array<{
      sort_by?: string;
      sort_order?: string;
    }>;
    pagination_parameters?: {
      page_number?: number;
      page_size?: number;
    };
  };
};

export type CommonOrganisationApiMockControl = {
  getLastPendingSearchPayload: () => OrganisationSearchApiRequestPayload | undefined;
  getLastActiveSearchPayload: () => OrganisationSearchApiRequestPayload | undefined;
  getLastPendingSearchTerm: () => string | undefined;
  getLastActiveSearchTerm: () => string | undefined;
};

type PendingDecisionApiMockState = {
  organisationId: string;
  status?: number;
  responseBody?: unknown;
};

type PendingOrganisationDecisionPayload = {
  organisationIdentifier?: string;
  status?: string;
};

type PendingDecisionApiMockControl = {
  getLastMethod: () => string | undefined;
  getLastPayload: () => PendingOrganisationDecisionPayload | undefined;
};

export function createMockOrganisation(overrides: Partial<MockOrganisation>): MockOrganisation {
  const identifier = overrides.organisationIdentifier ?? 'ORGMOCK1';

  return {
    organisationIdentifier: identifier,
    name: overrides.name ?? `${identifier} Name`,
    status: overrides.status ?? 'ACTIVE',
    companyNumber: overrides.companyNumber ?? '12345678',
    orgType: overrides.orgType ?? 'SOLICITOR',
    sraId: overrides.sraId ?? 'SRA12345',
    contactInformation: overrides.contactInformation ?? [{
      addressLine1: '1 Mock Street',
      addressLine2: 'Mock District',
      addressLine3: 'Mock Area',
      townCity: 'London',
      county: 'Greater London',
      postCode: 'EC1A 1BB',
      dxAddress: [{ dxNumber: 'DX 100', dxExchange: 'London' }]
    }],
    superUser: overrides.superUser ?? {
      userIdentifier: 'mock-user-id',
      firstName: 'Mock',
      lastName: 'Admin',
      email: 'mock-admin@example.com'
    },
    paymentAccount: overrides.paymentAccount ?? ['PBA1234567'],
    pendingPaymentAccount: overrides.pendingPaymentAccount ?? [],
    orgAttributes: overrides.orgAttributes ?? []
  };
}

function normaliseSearchTerm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function extractOrganisationSearchPayload(request: Request): OrganisationSearchApiRequestPayload | undefined {
  if (request.method().toUpperCase() !== 'POST') {
    return undefined;
  }

  try {
    return request.postDataJSON() as OrganisationSearchApiRequestPayload;
  } catch {
    return undefined;
  }
}

function resolveSearchTermFromPayload(payload?: OrganisationSearchApiRequestPayload): string | undefined {
  const searchTerm = normaliseSearchTerm(payload?.searchRequest?.search_filter);
  return searchTerm.length > 0 ? searchTerm : undefined;
}

function collectOrganisationSearchText(organisation: MockOrganisation): string {
  const contactText = organisation.contactInformation
    .flatMap((contact) => [
      contact.addressLine1,
      contact.addressLine2,
      contact.addressLine3,
      contact.townCity,
      contact.county,
      contact.postCode,
      ...contact.dxAddress.flatMap((dxAddress) => [dxAddress.dxNumber, dxAddress.dxExchange])
    ])
    .join(' ');

  return [
    organisation.organisationIdentifier,
    organisation.name,
    organisation.status,
    organisation.companyNumber,
    organisation.orgType,
    organisation.sraId,
    organisation.superUser.firstName,
    organisation.superUser.lastName,
    organisation.superUser.email,
    contactText,
    ...organisation.paymentAccount,
    ...organisation.pendingPaymentAccount
  ]
    .join(' ')
    .toLowerCase();
}

function filterOrganisationsBySearchRequest(request: Request, organisations: MockOrganisation[]): MockOrganisation[] {
  const payload = extractOrganisationSearchPayload(request);
  const searchTerm = resolveSearchTermFromPayload(payload);
  if (!searchTerm) {
    return organisations;
  }

  return organisations.filter((organisation) => collectOrganisationSearchText(organisation).includes(searchTerm));
}

function normaliseStatusValue(statusValue: string): string {
  return statusValue
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .join(',');
}

function resolveNormalisedStatusFromUrl(url: string): string {
  return normaliseStatusValue(new URL(url).searchParams.get('status') ?? '');
}

async function fulfillOrganisationStatusRequest(route: Route, request: Request, organisations: MockOrganisation[]): Promise<void> {
  const requestPayload = extractOrganisationSearchPayload(request);
  const paginatedOrganisations = request.method().toUpperCase() === 'POST'
    ? paginateMockItems(organisations, requestPayload)
    : organisations;

  const responseBody = request.method().toUpperCase() === 'POST'
    ? {
      organisations: paginatedOrganisations,
      total_records: organisations.length
    }
    : organisations;

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(responseBody)
  });
}

function shouldApplySearchResponseOverride(
  override: SearchResponseOverride | undefined,
  searchTerm: string | undefined
): boolean {
  if (!override) {
    return false;
  }

  if (!override.onlyWhenSearchTermPresent) {
    return true;
  }

  return Boolean(searchTerm);
}

async function fulfillOrganisationSearchResponse(
  route: Route,
  request: Request,
  organisations: MockOrganisation[],
  payload: OrganisationSearchApiRequestPayload | undefined,
  searchTerm: string | undefined,
  override: SearchResponseOverride | undefined
): Promise<void> {
  if (!shouldApplySearchResponseOverride(override, searchTerm)) {
    await fulfillOrganisationStatusRequest(route, request, organisations);
    return;
  }

  const statusCode = override?.status ?? 200;
  const paginatedOrganisations = paginateMockItems(organisations, payload);
  const responseBody = override?.body ?? (statusCode === 200 ? {
    organisations: paginatedOrganisations,
    total_records: organisations.length
  } : {});

  await route.fulfill({
    status: statusCode,
    contentType: 'application/json',
    body: JSON.stringify(responseBody)
  });
}

export async function setupCommonOrganisationApiMocks(
  page: Page,
  state: CommonOrganisationApiMockState = {}
): Promise<{ activeOrganisations: MockOrganisation[]; pendingOrganisations: MockOrganisation[] } & CommonOrganisationApiMockControl> {
  const singleOrganisationsById = state.singleOrganisationsById ?? {};
  let lastPendingSearchPayload: OrganisationSearchApiRequestPayload | undefined;
  let lastActiveSearchPayload: OrganisationSearchApiRequestPayload | undefined;

  const pendingOrganisations = state.pendingOrganisations ?? [
    createMockOrganisation({
      organisationIdentifier: 'PENDINGMOCK01',
      name: 'Pending Mock Org',
      status: 'PENDING',
      paymentAccount: [],
      pendingPaymentAccount: ['PBA1111111']
    })
  ];

  const activeOrganisations = state.activeOrganisations ?? [
    createMockOrganisation({
      organisationIdentifier: 'ACTIVEMOCK01',
      name: 'Active Mock Org',
      status: 'ACTIVE',
      paymentAccount: ['PBA2222222'],
      pendingPaymentAccount: []
    })
  ];

  await page.route('**/api/organisations?**', async (route, request) => {
    const requestUrl = new URL(request.url());
    const organisationId = (requestUrl.searchParams.get('organisationId') ?? '').trim();

    if (organisationId) {
      const resolvedOrganisation = singleOrganisationsById[organisationId]
        ?? activeOrganisations.find((organisation) => organisation.organisationIdentifier === organisationId)
        ?? pendingOrganisations.find((organisation) => organisation.organisationIdentifier === organisationId)
        ?? createMockOrganisation({
          organisationIdentifier: organisationId,
          status: 'ACTIVE'
        });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(resolvedOrganisation)
      });
      return;
    }

    const status = resolveNormalisedStatusFromUrl(request.url());

    if (status === 'ACTIVE') {
      lastActiveSearchPayload = extractOrganisationSearchPayload(request);
      const filteredActiveOrganisations = filterOrganisationsBySearchRequest(request, activeOrganisations);
      const searchTerm = resolveSearchTermFromPayload(lastActiveSearchPayload);
      await fulfillOrganisationSearchResponse(
        route,
        request,
        filteredActiveOrganisations,
        lastActiveSearchPayload,
        searchTerm,
        state.activeSearchResponse
      );
      return;
    }

    if (status === 'PENDING,REVIEW') {
      lastPendingSearchPayload = extractOrganisationSearchPayload(request);
      const filteredPendingOrganisations = filterOrganisationsBySearchRequest(request, pendingOrganisations);
      const searchTerm = resolveSearchTermFromPayload(lastPendingSearchPayload);
      await fulfillOrganisationSearchResponse(
        route,
        request,
        filteredPendingOrganisations,
        lastPendingSearchPayload,
        searchTerm,
        state.pendingSearchResponse
      );
      return;
    }

    await route.continue();
  });

  return {
    activeOrganisations,
    pendingOrganisations,
    getLastPendingSearchPayload: () => lastPendingSearchPayload,
    getLastActiveSearchPayload: () => lastActiveSearchPayload,
    getLastPendingSearchTerm: () => resolveSearchTermFromPayload(lastPendingSearchPayload),
    getLastActiveSearchTerm: () => resolveSearchTermFromPayload(lastActiveSearchPayload)
  };
}

export async function setupPendingOrganisationDecisionApiMock(
  page: Page,
  state: PendingDecisionApiMockState
): Promise<PendingDecisionApiMockControl> {
  let lastMethod: string | undefined;
  let lastPayload: PendingOrganisationDecisionPayload | undefined;

  await page.route('**/api/organisations/**', async (route, request) => {
    const method = request.method().toUpperCase();
    const pathName = new URL(request.url()).pathname;
    const expectedPath = `/api/organisations/${state.organisationId}`;

    if ((method === 'PUT' || method === 'DELETE') && pathName === expectedPath) {
      lastMethod = method;
      try {
        lastPayload = request.postDataJSON() as PendingOrganisationDecisionPayload;
      } catch {
        lastPayload = undefined;
      }

      await route.fulfill({
        status: state.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(state.responseBody ?? {})
      });
      return;
    }

    await route.continue();
  });

  return {
    getLastMethod: () => lastMethod,
    getLastPayload: () => lastPayload
  };
}

export function waitForPendingOrganisationDecisionResponse(page: Page, organisationId: string): Promise<Response> {
  const expectedPath = `/api/organisations/${organisationId}`;

  return page.waitForResponse((response) => {
    const request = response.request();
    const method = request.method().toUpperCase();
    if (method !== 'PUT' && method !== 'DELETE') {
      return false;
    }

    const pathName = new URL(request.url()).pathname;
    return pathName === expectedPath && response.status() < 500;
  });
}

export function waitForOrganisationStatusResponse(
  page: Page,
  statusValue: 'ACTIVE' | 'PENDING,REVIEW'
): Promise<Response> {
  const expectedStatus = normaliseStatusValue(statusValue);

  return page.waitForResponse((response) => {
    const requestUrl = response.request().url();
    if (!requestUrl.includes('/api/organisations?')) {
      return false;
    }

    const actualStatus = resolveNormalisedStatusFromUrl(requestUrl);
    return actualStatus === expectedStatus && response.status() === 200;
  });
}

export function waitForOrganisationStatusResponseWithHttpStatus(
  page: Page,
  statusValue: 'ACTIVE' | 'PENDING,REVIEW',
  expectedHttpStatus: number
): Promise<Response> {
  const expectedStatus = normaliseStatusValue(statusValue);

  return page.waitForResponse((response) => {
    const requestUrl = response.request().url();
    if (!requestUrl.includes('/api/organisations?')) {
      return false;
    }

    const actualStatus = resolveNormalisedStatusFromUrl(requestUrl);
    return actualStatus === expectedStatus && response.status() === expectedHttpStatus;
  });
}

export async function waitForOrganisationNameInTable(
  page: Page,
  tableSelector: string,
  organisationName: string
): Promise<void> {
  const table = page.locator(tableSelector);
  await expect(table).toBeVisible();

  const matchingRow = table.locator('tr.govuk-radios').filter({ hasText: organisationName }).first();
  await expect(matchingRow).toBeVisible();
}

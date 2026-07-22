import type { Page, Response } from '@playwright/test';
import { paginateMockItems } from './pagination.mocks';
import type { MockOrganisation } from './organisation.mocks';

type UpdatePbaApiMockState = {
  status?: number;
  responseBody?: unknown;
  singleOrganisationsById?: Record<string, Pick<MockOrganisation, 'paymentAccount' | 'pendingPaymentAccount'>>;
};

export type PendingPbaStatusApiRequestPayload = {
  searchRequest?: {
    search_filter?: string;
    pagination_parameters?: {
      page_number?: number;
      page_size?: number;
    };
    drill_down_search?: Array<{
      field_name?: string;
      search_filter?: string;
    }>;
  };
};

export type MockPendingPbaOrganisation = {
  organisationIdentifier: string;
  organisationName: string;
  superUser: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pbaNumbers: Array<{
    pbaNumber: string;
    dateCreated: string;
  }>;
};

export type PendingPbaStatusApiMockState = {
  pendingPbaOrganisations?: MockPendingPbaOrganisation[];
  status?: number;
  responseBody?: unknown;
  onlyWhenSearchTermPresent?: boolean;
};

export type PendingPbaStatusApiMockControl = {
  getLastPayload: () => PendingPbaStatusApiRequestPayload | undefined;
  getLastSearchTerm: () => string | undefined;
};

type UpdatePbaApiPayload = {
  paymentAccounts: string[];
  orgId: string;
};

type PbaStatusUpdateApiMockState = {
  status?: number;
  responseBody?: unknown;
};

type PbaStatusUpdatePayload = {
  pbaNumbers?: Array<{
    pbaNumber?: string;
    status?: string;
    statusMessage?: string;
  }>;
  orgId?: string;
};

type PbaStatusUpdateApiMockControl = {
  getLastPayload: () => PbaStatusUpdatePayload | undefined;
};

type UpdatePbaApiMockControl = {
  getLastPayload: () => UpdatePbaApiPayload | undefined;
};

type SetPbaStatusApiPayload = {
  pbaNumbers: Array<{
    pbaNumber: string;
    status: string;
    statusMessage: string;
  }>;
  orgId: string;
};

type SetPbaStatusApiMockControl = {
  getLastPayload: () => SetPbaStatusApiPayload | undefined;
};

function normaliseSearchTerm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function resolvePendingPbaSearchTerm(payload: PendingPbaStatusApiRequestPayload | undefined): string | undefined {
  const drillDownSearchItems = payload?.searchRequest?.drill_down_search ?? [];
  for (const drillDownSearchItem of drillDownSearchItems) {
    const searchTerm = normaliseSearchTerm(drillDownSearchItem.search_filter);
    if (searchTerm.length > 0) {
      return searchTerm;
    }
  }

  return undefined;
}

function collectPendingPbaSearchText(organisation: MockPendingPbaOrganisation): string {
  return [
    organisation.organisationIdentifier,
    organisation.organisationName,
    organisation.superUser.firstName,
    organisation.superUser.lastName,
    organisation.superUser.email,
    ...organisation.pbaNumbers.flatMap((pbaNumber) => [pbaNumber.pbaNumber])
  ]
    .join(' ')
    .toLowerCase();
}

function filterPendingPbaOrganisations(
  pendingPbaOrganisations: MockPendingPbaOrganisation[],
  payload: PendingPbaStatusApiRequestPayload | undefined
): MockPendingPbaOrganisation[] {
  const searchTerm = resolvePendingPbaSearchTerm(payload);
  if (!searchTerm) {
    return pendingPbaOrganisations;
  }

  return pendingPbaOrganisations.filter((organisation) => collectPendingPbaSearchText(organisation).includes(searchTerm));
}

async function setupPbaStatusApiMock(
  page: Page,
  state: PbaStatusUpdateApiMockState = {}
): Promise<PbaStatusUpdateApiMockControl> {
  let lastPayload: PbaStatusUpdatePayload | undefined;

  await page.route('**/api/pba/status', async (route, request) => {
    if (request.method().toUpperCase() !== 'PUT') {
      await route.fallback();
      return;
    }

    try {
      lastPayload = request.postDataJSON() as PbaStatusUpdatePayload;
    } catch {
      lastPayload = undefined;
    }

    await route.fulfill({
      status: state.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(state.responseBody ?? { ok: true })
    });
  });

  return {
    getLastPayload: () => lastPayload
  };
}

export function createMockPendingPbaOrganisation(overrides: Partial<MockPendingPbaOrganisation>): MockPendingPbaOrganisation {
  const organisationIdentifier = overrides.organisationIdentifier ?? 'PBAORGMOCK1';

  return {
    organisationIdentifier,
    organisationName: overrides.organisationName ?? `${organisationIdentifier} Name`,
    superUser: overrides.superUser ?? {
      firstName: 'Mock',
      lastName: 'Pba',
      email: 'mock-pba-admin@example.com'
    },
    pbaNumbers: overrides.pbaNumbers ?? [{
      pbaNumber: 'PBA1234567',
      dateCreated: new Date('2024-01-01T00:00:00.000Z').toISOString()
    }]
  };
}

export async function setupUpdatePbaApiMock(
  page: Page,
  state: UpdatePbaApiMockState = {}
): Promise<UpdatePbaApiMockControl> {
  let lastPayload: UpdatePbaApiPayload | undefined;

  await page.route('**/api/updatePba**', async (route, request) => {
    const statusCode = state.status ?? 200;

    try {
      lastPayload = request.postDataJSON() as UpdatePbaApiPayload;
    } catch {
      lastPayload = undefined;
    }

    if (statusCode >= 200 && statusCode < 300 && lastPayload?.orgId) {
      const updatedOrganisation = state.singleOrganisationsById?.[lastPayload.orgId];
      if (updatedOrganisation) {
        updatedOrganisation.paymentAccount = lastPayload.paymentAccounts;
        updatedOrganisation.pendingPaymentAccount = [];
      }
    }

    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify(state.responseBody ?? { ok: true })
    });
  });

  return {
    getLastPayload: () => lastPayload
  };
}

export async function setupSetPbaStatusApiMock(
  page: Page,
  state: UpdatePbaApiMockState = {}
): Promise<PbaStatusUpdateApiMockControl> {
  return setupPbaStatusApiMock(page, state);
}

export async function setupPbaAccountsApiMock(page: Page, accountNames: string[] = ['Mock Liberata Account']): Promise<void> {
  await page.route('**/api/pbaAccounts/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(accountNames.map((accountName) => ({ account_name: accountName })))
    });
  });
}

export async function setupPbaStatusUpdateApiMock(
  page: Page,
  state: PbaStatusUpdateApiMockState = {}
): Promise<PbaStatusUpdateApiMockControl> {
  return setupPbaStatusApiMock(page, state);
}

export async function setupPendingPbaStatusApiMock(
  page: Page,
  state: PendingPbaStatusApiMockState = {}
): Promise<PendingPbaStatusApiMockControl> {
  const pendingPbaOrganisations = state.pendingPbaOrganisations ?? [
    createMockPendingPbaOrganisation({
      organisationIdentifier: 'PBAORGMOCK01',
      organisationName: 'Pending PBA Mock Org One',
      pbaNumbers: [{ pbaNumber: 'PBA1111111', dateCreated: new Date('2024-01-10T00:00:00.000Z').toISOString() }]
    }),
    createMockPendingPbaOrganisation({
      organisationIdentifier: 'PBAORGMOCK02',
      organisationName: 'Pending PBA Mock Org Two',
      pbaNumbers: [{ pbaNumber: 'PBA2222222', dateCreated: new Date('2024-01-11T00:00:00.000Z').toISOString() }]
    })
  ];

  let lastPayload: PendingPbaStatusApiRequestPayload | undefined;

  await page.route('**/api/pba/status/pending**', async (route, request) => {
    if (request.method().toUpperCase() === 'POST') {
      try {
        lastPayload = request.postDataJSON() as PendingPbaStatusApiRequestPayload;
      } catch {
        lastPayload = undefined;
      }
    }

    const filteredPendingPbaOrganisations = filterPendingPbaOrganisations(pendingPbaOrganisations, lastPayload);
    const paginatedPendingPbaOrganisations = paginateMockItems(filteredPendingPbaOrganisations, lastPayload);
    const shouldApplyOverride = state.onlyWhenSearchTermPresent
      ? Boolean(resolvePendingPbaSearchTerm(lastPayload))
      : true;

    const resolvedStatusCode = shouldApplyOverride ? (state.status ?? 200) : 200;
    let body: unknown;

    if (shouldApplyOverride) {
      body = state.responseBody ?? (resolvedStatusCode === 200 ? {
        organisations: paginatedPendingPbaOrganisations,
        total_records: filteredPendingPbaOrganisations.length
      } : {});
    } else {
      body = {
        organisations: paginatedPendingPbaOrganisations,
        total_records: filteredPendingPbaOrganisations.length
      };
    }

    await route.fulfill({
      status: resolvedStatusCode,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });
  });

  return {
    getLastPayload: () => lastPayload,
    getLastSearchTerm: () => resolvePendingPbaSearchTerm(lastPayload)
  };
}

export function waitForPendingPbaStatusResponse(page: Page): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method().toUpperCase() === 'POST'
      && request.url().includes('/api/pba/status/pending')
      && response.status() < 500;
  });
}

export function waitForPendingPbaStatusResponseWithHttpStatus(
  page: Page,
  expectedHttpStatus: number
): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method().toUpperCase() === 'POST'
      && request.url().includes('/api/pba/status/pending')
      && response.status() === expectedHttpStatus;
  });
}

export function waitForUpdatePbaResponse(page: Page): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method().toUpperCase() === 'PUT' && request.url().includes('/api/updatePba') && response.status() < 500;
  });
}

export function waitForUpdatePbaResponseWithHttpStatus(page: Page, expectedHttpStatus: number): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method().toUpperCase() === 'PUT'
      && request.url().includes('/api/updatePba')
      && response.status() === expectedHttpStatus;
  });
}

export function waitForSetPbaStatusResponse(page: Page): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method().toUpperCase() === 'PUT'
      && request.url().includes('/api/pba/status')
      && !request.url().includes('/api/pba/status/pending')
      && response.status() < 500;
  });
}

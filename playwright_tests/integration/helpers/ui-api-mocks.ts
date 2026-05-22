import { expect, type Page, type Request, type Response, type Route } from '@playwright/test';

export const PENDING_ORGANISATIONS_TABLE_SELECTOR = 'table.pending-organisations';
export const ACTIVE_ORGANISATIONS_TABLE_SELECTOR = 'table.active-organisations';

type MockOrganisation = {
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

type CommonOrganisationApiMockState = {
  activeOrganisations?: MockOrganisation[];
  pendingOrganisations?: MockOrganisation[];
  singleOrganisationsById?: Record<string, MockOrganisation>;
};

type UpdatePbaApiMockState = {
  status?: number;
  responseBody?: unknown;
};

type UpdatePbaApiPayload = {
  paymentAccounts: string[];
  orgId: string;
};

type UpdatePbaApiMockControl = {
  getLastPayload: () => UpdatePbaApiPayload | undefined;
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
      email: 'mock-admin@mailnesia.com'
    },
    paymentAccount: overrides.paymentAccount ?? ['PBA1234567'],
    pendingPaymentAccount: overrides.pendingPaymentAccount ?? [],
    orgAttributes: overrides.orgAttributes ?? []
  };
}

function normaliseStatusValue(statusValue: string): string {
  return statusValue
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');
}

function resolveNormalisedStatusFromUrl(url: string): string {
  return normaliseStatusValue(new URL(url).searchParams.get('status') ?? '');
}

async function fulfillOrganisationStatusRequest(route: Route, request: Request, organisations: MockOrganisation[]): Promise<void> {
  const payload = request.method().toUpperCase() === 'POST'
    ? {
      organisations,
      total_records: organisations.length
    }
    : organisations;

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload)
  });
}

export async function setupCommonOrganisationApiMocks(
  page: Page,
  state: CommonOrganisationApiMockState = {}
): Promise<{ activeOrganisations: MockOrganisation[]; pendingOrganisations: MockOrganisation[] }> {
  const singleOrganisationsById = state.singleOrganisationsById ?? {};
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
      await fulfillOrganisationStatusRequest(route, request, activeOrganisations);
      return;
    }

    if (status === 'PENDING,REVIEW') {
      await fulfillOrganisationStatusRequest(route, request, pendingOrganisations);
      return;
    }

    await route.continue();
  });

  return {
    activeOrganisations,
    pendingOrganisations
  };
}

export async function setupUpdatePbaApiMock(
  page: Page,
  state: UpdatePbaApiMockState = {}
): Promise<UpdatePbaApiMockControl> {
  let lastPayload: UpdatePbaApiPayload | undefined;

  await page.route('**/api/updatePba**', async (route, request) => {
    try {
      lastPayload = request.postDataJSON() as UpdatePbaApiPayload;
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

export function waitForUpdatePbaResponse(page: Page): Promise<Response> {
  return page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === 'PUT' && request.url().includes('/api/updatePba') && response.status() < 500;
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

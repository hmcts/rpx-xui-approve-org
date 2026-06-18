import type { Page } from '@playwright/test';
import {
  type OrganisationSearchApiRequestPayload,
  type CommonOrganisationApiMockState,
  type MockOrganisation,
  setupCommonOrganisationApiMocks
} from './organisation.mocks';
import {
  createMockPendingPbaOrganisation,
  type MockPendingPbaOrganisation,
  type PendingPbaStatusApiRequestPayload,
  setupPbaAccountsApiMock,
  setupPendingPbaStatusApiMock,
  type PendingPbaStatusApiMockControl
} from './pba.mocks';
import { setupLovRefDataApiMock } from './reference-data.mocks';

type PendingPbaSearchResponseOverride = {
  status?: number;
  body?: unknown;
  onlyWhenSearchTermPresent?: boolean;
};

export type StandardOrganisationApprovalsApiMockState = {
  organisations?: CommonOrganisationApiMockState;
  pendingPbaOrganisations?: MockPendingPbaOrganisation[];
  pendingPbaSearchResponse?: PendingPbaSearchResponseOverride;
  listOfValues?: unknown[];
  accountNames?: string[];
  organisationDeletableById?: Record<string, boolean>;
  defaultOrganisationDeletable?: boolean;
};

export type StandardOrganisationApprovalsApiMockResult = {
  activeOrganisations: MockOrganisation[];
  pendingOrganisations: MockOrganisation[];
  pendingPbaOrganisations: MockPendingPbaOrganisation[];
  getLastPendingOrganisationSearchPayload: () => OrganisationSearchApiRequestPayload | undefined;
  getLastActiveOrganisationSearchPayload: () => OrganisationSearchApiRequestPayload | undefined;
  getLastPendingPbaSearchPayload: () => PendingPbaStatusApiRequestPayload | undefined;
  getLastPendingOrganisationSearchTerm: () => string | undefined;
  getLastActiveOrganisationSearchTerm: () => string | undefined;
  getLastPendingPbaSearchTerm: () => string | undefined;
  getLastSingleOrganisationId: () => string | undefined;
  pendingPbaStatusApiMock: PendingPbaStatusApiMockControl;
};

function resolveOrganisationIdFromIsDeletablePath(pathname: string): string | undefined {
  const match = pathname.match(/\/api\/organisations\/([^/]+)\/isDeletable$/);
  return match?.[1];
}

export async function setupStandardOrganisationApprovalsApiMocks(
  page: Page,
  state: StandardOrganisationApprovalsApiMockState = {}
): Promise<StandardOrganisationApprovalsApiMockResult> {
  const organisationMocks = await setupCommonOrganisationApiMocks(page, state.organisations ?? {});

  const pendingPbaOrganisations = state.pendingPbaOrganisations ?? [
    createMockPendingPbaOrganisation({
      organisationIdentifier: 'PBASTANDARD01',
      organisationName: 'Standard PBA Mock Org One',
      pbaNumbers: [{ pbaNumber: 'PBA3000001', dateCreated: new Date('2024-02-01T00:00:00.000Z').toISOString() }]
    }),
    createMockPendingPbaOrganisation({
      organisationIdentifier: 'PBASTANDARD02',
      organisationName: 'Standard PBA Mock Org Two',
      pbaNumbers: [{ pbaNumber: 'PBA3000002', dateCreated: new Date('2024-02-02T00:00:00.000Z').toISOString() }]
    })
  ];

  const pendingPbaStatusApiMock = await setupPendingPbaStatusApiMock(page, {
    pendingPbaOrganisations,
    status: state.pendingPbaSearchResponse?.status,
    responseBody: state.pendingPbaSearchResponse?.body,
    onlyWhenSearchTermPresent: state.pendingPbaSearchResponse?.onlyWhenSearchTermPresent
  });

  await setupPbaAccountsApiMock(page, state.accountNames ?? ['Mock Liberata Account']);
  await setupLovRefDataApiMock(page, state.listOfValues ?? []);

  const defaultOrganisationDeletable = state.defaultOrganisationDeletable ?? false;

  await page.route('**/api/organisations/*/isDeletable', async (route, request) => {
    const pathName = new URL(request.url()).pathname;
    const organisationId = resolveOrganisationIdFromIsDeletablePath(pathName);
    const isDeletable = organisationId
      ? state.organisationDeletableById?.[organisationId] ?? defaultOrganisationDeletable
      : defaultOrganisationDeletable;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isDeletable)
    });
  });

  return {
    activeOrganisations: organisationMocks.activeOrganisations,
    pendingOrganisations: organisationMocks.pendingOrganisations,
    pendingPbaOrganisations,
    getLastPendingOrganisationSearchPayload: organisationMocks.getLastPendingSearchPayload,
    getLastActiveOrganisationSearchPayload: organisationMocks.getLastActiveSearchPayload,
    getLastPendingPbaSearchPayload: pendingPbaStatusApiMock.getLastPayload,
    getLastPendingOrganisationSearchTerm: organisationMocks.getLastPendingSearchTerm,
    getLastActiveOrganisationSearchTerm: organisationMocks.getLastActiveSearchTerm,
    getLastPendingPbaSearchTerm: pendingPbaStatusApiMock.getLastSearchTerm,
    getLastSingleOrganisationId: organisationMocks.getLastSingleOrganisationId,
    pendingPbaStatusApiMock
  };
}

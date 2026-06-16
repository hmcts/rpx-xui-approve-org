import type { Page, Response } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
import { OrganisationApprovalsPage } from '../../page-objects/pages';
import {
  setupStandardOrganisationApprovalsApiMocks,
  type StandardOrganisationApprovalsApiMockResult,
  type StandardOrganisationApprovalsApiMockState,
  type MockOrganisation
} from '../mocks';
import {
  buildOrganisationByIdRecord,
  defaultActiveSearchOrganisations,
  defaultPendingPbaSearchOrganisations,
  defaultPendingSearchOrganisations
} from '../test-data/organisation-search.data';

export type OrganisationSearchIntegrationPageSetup = {
  organisationApprovalsPage: OrganisationApprovalsPage;
  standardApiMocks: StandardOrganisationApprovalsApiMockResult;
};

export type PaginatedOrganisationResponse = {
  organisations: Array<{ organisationIdentifier?: string }>;
  total_records: number;
};

function mergeSingleOrganisationByIdOverrides(
  organisations: MockOrganisation[],
  explicitById: Record<string, MockOrganisation> | undefined
): Record<string, MockOrganisation> {
  return {
    ...buildOrganisationByIdRecord(organisations),
    ...(explicitById ?? {})
  };
}

function resolveStandardSearchMockState(state: StandardOrganisationApprovalsApiMockState): StandardOrganisationApprovalsApiMockState {
  const pendingOrganisations = state.organisations?.pendingOrganisations ?? defaultPendingSearchOrganisations;
  const activeOrganisations = state.organisations?.activeOrganisations ?? defaultActiveSearchOrganisations;
  const combinedOrganisations = [...pendingOrganisations, ...activeOrganisations];

  return {
    ...state,
    organisations: {
      ...state.organisations,
      pendingOrganisations,
      activeOrganisations,
      singleOrganisationsById: mergeSingleOrganisationByIdOverrides(
        combinedOrganisations,
        state.organisations?.singleOrganisationsById
      )
    },
    pendingPbaOrganisations: state.pendingPbaOrganisations ?? defaultPendingPbaSearchOrganisations
  };
}

export async function setupOrganisationSearchIntegrationPage(
  page: Page,
  state: StandardOrganisationApprovalsApiMockState = {}
): Promise<OrganisationSearchIntegrationPageSetup> {
  const resolvedState = resolveStandardSearchMockState(state);
  const standardApiMocks = await setupStandardOrganisationApprovalsApiMocks(page, resolvedState);

  await ensureAuthenticatedPage(page, 'base');

  const organisationApprovalsPage = new OrganisationApprovalsPage(page);
  await organisationApprovalsPage.heading.waitFor({ state: 'visible' });
  await organisationApprovalsPage.tabPanel.waitFor({ state: 'visible' });

  return {
    organisationApprovalsPage,
    standardApiMocks
  };
}

export function getPaginationSummaryPattern(
  startResult: number,
  endResult: number,
  totalResults: number
): RegExp {
  return new RegExp(
    `Showing\\s*${startResult}\\s*to\\s*${endResult}\\s*of\\s*${totalResults}\\s*results`,
    'i'
  );
}

export async function readPaginatedOrganisationResponse(
  responsePromise: Promise<Response>
): Promise<PaginatedOrganisationResponse> {
  const response = await responsePromise;
  return response.json() as Promise<PaginatedOrganisationResponse>;
}

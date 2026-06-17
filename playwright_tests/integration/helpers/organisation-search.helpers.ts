import type { Page } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
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
  standardApiMocks: StandardOrganisationApprovalsApiMockResult;
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

  return {
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

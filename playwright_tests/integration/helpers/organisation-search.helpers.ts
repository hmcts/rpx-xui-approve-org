import { expect, type Locator, type Page, type Response } from '@playwright/test';
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

type PaginatedOrganisationResponse = {
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

export async function openPaginationPage(page: Page, pageNumber: number): Promise<void> {
  const pagination = getPaginationLocator(page);
  await pagination.waitFor({ state: 'visible' });

  const pageNumberText = String(pageNumber);
  const linkCandidate = pagination.getByRole('link', { name: pageNumberText }).first();
  if (await linkCandidate.count()) {
    await linkCandidate.click();
    return;
  }

  const buttonCandidate = pagination.getByRole('button', { name: pageNumberText }).first();
  if (await buttonCandidate.count()) {
    await buttonCandidate.click();
    return;
  }

  await pagination.locator('a, button').filter({ hasText: pageNumberText }).first().click();
}

export function getPaginationLocator(page: Page): Locator {
  return page.locator('xuilib-hmcts-pagination');
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

export async function assertPaginatedOrganisationIds(
  responsePromise: Promise<Response>,
  expectedTotalRecords: number,
  expectedOrganisationIds: string[]
): Promise<void> {
  const response = await responsePromise;
  const body = await response.json() as PaginatedOrganisationResponse;

  expect(body.total_records).toBe(expectedTotalRecords);
  expect(body.organisations.map((organisation) => organisation.organisationIdentifier)).toEqual(expectedOrganisationIds);
}

export async function assertPendingOrganisationSearchResult(
  organisationApprovalsPage: OrganisationApprovalsPage,
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  matchingOrganisationName: string,
  nonMatchingOrganisationName: string,
  expectedSearchTerm: string
): Promise<void> {
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(matchingOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(nonMatchingOrganisationName)).toHaveCount(0);
  expect(standardApiMocks.getLastPendingOrganisationSearchTerm()).toEqual(expectedSearchTerm.toLowerCase());
}

export async function assertActiveOrganisationSearchResult(
  organisationApprovalsPage: OrganisationApprovalsPage,
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  matchingOrganisationName: string,
  nonMatchingOrganisationName: string,
  expectedSearchTerm: string
): Promise<void> {
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(matchingOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(nonMatchingOrganisationName)).toHaveCount(0);
  expect(standardApiMocks.getLastActiveOrganisationSearchTerm()).toEqual(expectedSearchTerm.toLowerCase());
}

export async function assertPendingPbaSearchResult(
  organisationApprovalsPage: OrganisationApprovalsPage,
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  matchingOrganisationName: string,
  nonMatchingOrganisationName: string,
  expectedSearchTerm: string
): Promise<void> {
  await expect(organisationApprovalsPage.pendingPbaRowsByText(matchingOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.pendingPbaRowsByText(nonMatchingOrganisationName)).toHaveCount(0);
  expect(standardApiMocks.getLastPendingPbaSearchTerm()).toEqual(expectedSearchTerm.toLowerCase());
}

export async function assertPaginationSummary(
  page: Page,
  startResult: number,
  endResult: number,
  totalResults: number
): Promise<void> {
  await expect(getPaginationLocator(page)).toContainText(
    getPaginationSummaryPattern(startResult, endResult, totalResults)
  );
}

export async function assertPendingOrganisationPageRows(
  organisationApprovalsPage: OrganisationApprovalsPage,
  visibleOrganisationName: string,
  hiddenOrganisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(visibleOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.pendingOrganisationRowsByName(hiddenOrganisationName)).toHaveCount(0);
}

export async function assertActiveOrganisationPageRows(
  organisationApprovalsPage: OrganisationApprovalsPage,
  visibleOrganisationName: string,
  hiddenOrganisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(visibleOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(hiddenOrganisationName)).toHaveCount(0);
}

export async function assertPendingPbaPageRows(
  organisationApprovalsPage: OrganisationApprovalsPage,
  visibleOrganisationName: string,
  hiddenOrganisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.pendingPbaRowsByText(visibleOrganisationName).first()).toBeVisible();
  await expect(organisationApprovalsPage.pendingPbaRowsByText(hiddenOrganisationName)).toHaveCount(0);
}

export function assertPendingOrganisationPageRequested(
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  pageNumber: number
): void {
  expect(standardApiMocks.getLastPendingOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(pageNumber);
}

export function assertActiveOrganisationPageRequested(
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  pageNumber: number
): void {
  expect(standardApiMocks.getLastActiveOrganisationSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(pageNumber);
}

export function assertPendingPbaPageRequested(
  standardApiMocks: StandardOrganisationApprovalsApiMockResult,
  pageNumber: number
): void {
  expect(standardApiMocks.getLastPendingPbaSearchPayload()?.searchRequest?.pagination_parameters?.page_number).toEqual(pageNumber);
}

export async function assertSearchRedirect(page: Page, expectedRedirectPath: RegExp): Promise<void> {
  await expect(page).toHaveURL(expectedRedirectPath);
}

export async function assertPendingOrganisationEmptyState(page: Page): Promise<void> {
  await expect(page.getByText('There are no new registrations.')).toBeVisible();
}

export async function assertActiveOrganisationRowVisible(
  organisationApprovalsPage: OrganisationApprovalsPage,
  organisationName: string
): Promise<void> {
  await expect(organisationApprovalsPage.activeOrganisationRowsByText(organisationName).first()).toBeVisible();
}

export async function assertPendingPbaEmptyState(page: Page): Promise<void> {
  await expect(page.getByText('There are no new PBA requests.')).toBeVisible();
}

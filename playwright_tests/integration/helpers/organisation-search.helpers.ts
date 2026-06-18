import type { Page } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
import type {
  OrganisationTableRow,
  PendingPbaTableRow
} from '../../page-objects/pages/exui/organisation-approvals.page';
import {
  setupStandardOrganisationApprovalsApiMocks,
  type StandardOrganisationApprovalsApiMockResult,
  type StandardOrganisationApprovalsApiMockState,
  type MockOrganisation,
  type MockPendingPbaOrganisation
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

export type PendingOrganisationDecisionRequestPayload = {
  organisationIdentifier: string;
  sraId: string;
  contactInformation: Array<{
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    county: string;
    dxAddress: Array<{ dxNumber: string; dxExchange: string }>;
  }>;
  superUser: {
    userIdentifier: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  name: string;
  paymentAccount: string[];
  pendingPaymentAccount: string[];
  orgAttributes: Array<{ key: string; value: string }>;
  companyNumber: string;
  orgType: string;
};

export async function clearOrganisationSearchSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.sessionStorage.removeItem('searchString');
  });

  await page.evaluate(() => {
    window.sessionStorage.removeItem('searchString');
  }).catch(() => undefined);
}

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
  await clearOrganisationSearchSession(page);

  const resolvedState = resolveStandardSearchMockState(state);
  const standardApiMocks = await setupStandardOrganisationApprovalsApiMocks(page, resolvedState);

  await ensureAuthenticatedPage(page, 'base');

  return {
    standardApiMocks
  };
}

function normaliseTableText(values: Array<string | undefined>): string {
  return values
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTableDate(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');

  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function organisationAddress(organisation: MockOrganisation): string {
  const contactInformation = organisation.contactInformation[0];
  if (!contactInformation) {
    return '';
  }

  return normaliseTableText([
    contactInformation.addressLine1,
    contactInformation.addressLine2,
    contactInformation.addressLine3,
    contactInformation.townCity,
    contactInformation.county,
    contactInformation.postCode
  ]);
}

function organisationStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'PENDING':
      return status.toUpperCase();
    case 'REVIEW':
      return 'UNDER REVIEW';
    default:
      return '';
  }
}

function organisationTableDate(organisation: MockOrganisation): string {
  return formatTableDate(
    organisation.status.toUpperCase() === 'ACTIVE' ? organisation.dateApproved : organisation.dateReceived
  );
}

function pendingPbaReceivedDate(organisation: MockPendingPbaOrganisation): string {
  const earliestPbaDate = organisation.pbaNumbers
    .map(({ dateCreated }) => new Date(dateCreated))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime())[0];

  return formatTableDate(earliestPbaDate?.toISOString());
}

export function organisationTableRowsFromMockData(organisations: MockOrganisation[]): OrganisationTableRow[] {
  return organisations.map((organisation) => ({
    name: organisation.name,
    organisationIdentifier: organisation.organisationIdentifier,
    address: organisationAddress(organisation),
    administrator: normaliseTableText([organisation.superUser.firstName, organisation.superUser.lastName]),
    administratorEmail: organisation.superUser.email,
    date: organisationTableDate(organisation),
    status: organisationStatusLabel(organisation.status)
  }));
}

export function pendingPbaTableRowsFromMockData(organisations: MockPendingPbaOrganisation[]): PendingPbaTableRow[] {
  return organisations.map((organisation) => ({
    organisationName: organisation.organisationName,
    pbaNumbers: organisation.pbaNumbers.map(({ pbaNumber }) => pbaNumber),
    administrator: normaliseTableText([organisation.superUser.firstName, organisation.superUser.lastName]),
    administratorEmail: organisation.superUser.email,
    dateReceived: pendingPbaReceivedDate(organisation)
  }));
}

export function pendingOrganisationDecisionPayloadFromMockData(
  organisation: MockOrganisation,
  status: 'ACTIVE' | 'REVIEW'
): PendingOrganisationDecisionRequestPayload {
  const contactInformation = organisation.contactInformation[0];
  const administrator = normaliseTableText([organisation.superUser.firstName, organisation.superUser.lastName]);

  return {
    organisationIdentifier: organisation.organisationIdentifier,
    sraId: organisation.sraId,
    contactInformation: [{
      addressLine1: contactInformation.addressLine1,
      addressLine2: contactInformation.addressLine2,
      townCity: contactInformation.townCity,
      county: contactInformation.county,
      dxAddress: contactInformation.dxAddress
    }],
    superUser: {
      userIdentifier: administrator,
      firstName: administrator,
      lastName: administrator,
      email: organisation.superUser.email
    },
    status,
    name: organisation.name,
    paymentAccount: organisation.paymentAccount,
    pendingPaymentAccount: organisation.pendingPaymentAccount,
    orgAttributes: organisation.orgAttributes,
    companyNumber: organisation.companyNumber,
    orgType: organisation.orgType
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

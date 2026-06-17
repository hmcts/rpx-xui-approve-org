import {
  createMockOrganisation,
  createMockPendingPbaOrganisation,
  type MockOrganisation,
  type MockPendingPbaOrganisation
} from '../mocks';

type SearchStatusCodeScenario = {
  statusCode: number;
  expectedRedirectPath: RegExp;
  expectedErrorHeading: string;
};

const NOT_AUTHORISED_ERROR_HEADING = 'Sorry, you\'re not authorised to perform this action';
const SERVICE_DOWN_ERROR_HEADING = 'Sorry, there is a problem with the service';

export const ORGANISATION_SEARCH_TERMS = {
  pendingByName: 'Search Pending',
  activeByName: 'Search Active',
  pendingByAddress: 'SE15TY',
  pendingPbaByName: 'Search PBA',
  pendingPagination: 'Paged Pending',
  activePagination: 'Paged Active',
  pendingPbaPagination: 'Paged PBA'
} as const;

export const pendingSearchMatchOrganisation = createMockOrganisation({
  organisationIdentifier: 'PENDINGSEARCH01',
  name: 'Search Pending Org One',
  status: 'PENDING',
  contactInformation: [{
    addressLine1: '15 Search Street',
    addressLine2: 'Search District',
    addressLine3: 'Search Area',
    townCity: 'London',
    county: 'Greater London',
    postCode: 'SE15TY',
    dxAddress: [{ dxNumber: 'DX 200', dxExchange: 'London' }]
  }],
  paymentAccount: [],
  pendingPaymentAccount: ['PBA1000001']
});

export const pendingNonMatchingOrganisation = createMockOrganisation({
  organisationIdentifier: 'PENDINGSEARCH02',
  name: 'Background Pending Org Two',
  status: 'PENDING',
  contactInformation: [{
    addressLine1: '99 Fallback Road',
    addressLine2: 'Fallback District',
    addressLine3: 'Fallback Area',
    townCity: 'Leeds',
    county: 'West Yorkshire',
    postCode: 'LS11AA',
    dxAddress: [{ dxNumber: 'DX 201', dxExchange: 'Leeds' }]
  }],
  paymentAccount: [],
  pendingPaymentAccount: ['PBA1000002']
});

export const activeSearchMatchOrganisation = createMockOrganisation({
  organisationIdentifier: 'ACTIVESEARCH01',
  name: 'Search Active Org One',
  status: 'ACTIVE',
  paymentAccount: ['PBA2000001'],
  pendingPaymentAccount: []
});

export const activeNonMatchingOrganisation = createMockOrganisation({
  organisationIdentifier: 'ACTIVESEARCH02',
  name: 'Background Active Org Two',
  status: 'ACTIVE',
  paymentAccount: ['PBA2000002'],
  pendingPaymentAccount: []
});

export const pendingPbaSearchMatchOrganisation = createMockPendingPbaOrganisation({
  organisationIdentifier: 'PBASEARCH01',
  organisationName: 'Search PBA Org One',
  pbaNumbers: [{ pbaNumber: 'PBA3000001', dateCreated: new Date('2024-03-01T00:00:00.000Z').toISOString() }]
});

export const pendingPbaNonMatchingOrganisation = createMockPendingPbaOrganisation({
  organisationIdentifier: 'PBASEARCH02',
  organisationName: 'Background PBA Org Two',
  pbaNumbers: [{ pbaNumber: 'PBA3000002', dateCreated: new Date('2024-03-02T00:00:00.000Z').toISOString() }]
});

export const defaultPendingSearchOrganisations: MockOrganisation[] = [
  pendingSearchMatchOrganisation,
  pendingNonMatchingOrganisation
];

export const defaultActiveSearchOrganisations: MockOrganisation[] = [
  activeSearchMatchOrganisation,
  activeNonMatchingOrganisation
];

export const defaultPendingPbaSearchOrganisations: MockPendingPbaOrganisation[] = [
  pendingPbaSearchMatchOrganisation,
  pendingPbaNonMatchingOrganisation
];

export function buildOrganisationByIdRecord(organisations: MockOrganisation[]): Record<string, MockOrganisation> {
  return organisations.reduce<Record<string, MockOrganisation>>((result, organisation) => {
    result[organisation.organisationIdentifier] = organisation;
    return result;
  }, {});
}

export function buildPendingPaginationOrganisations(total: number = 11): MockOrganisation[] {
  return Array.from({ length: total }, (_unused, index) => {
    const sequence = index + 1;
    const paddedSequence = sequence.toString().padStart(2, '0');
    return createMockOrganisation({
      organisationIdentifier: `PENDINGPAGE${paddedSequence}`,
      name: `${ORGANISATION_SEARCH_TERMS.pendingPagination} Org ${paddedSequence}`,
      status: 'PENDING',
      contactInformation: [{
        addressLine1: `${sequence} Pagination Street`,
        addressLine2: 'Pagination District',
        addressLine3: 'Pagination Area',
        townCity: 'London',
        county: 'Greater London',
        postCode: `E1${paddedSequence}AA`,
        dxAddress: [{ dxNumber: `DX 4${paddedSequence}`, dxExchange: 'London' }]
      }],
      paymentAccount: [],
      pendingPaymentAccount: [`PBA41${paddedSequence}001`]
    });
  });
}

export function buildActivePaginationOrganisations(total: number = 11): MockOrganisation[] {
  return Array.from({ length: total }, (_unused, index) => {
    const sequence = index + 1;
    const paddedSequence = sequence.toString().padStart(2, '0');
    return createMockOrganisation({
      organisationIdentifier: `ACTIVEPAGE${paddedSequence}`,
      name: `${ORGANISATION_SEARCH_TERMS.activePagination} Org ${paddedSequence}`,
      status: 'ACTIVE',
      paymentAccount: [`PBA51${paddedSequence}001`],
      pendingPaymentAccount: []
    });
  });
}

export function buildPendingPbaPaginationOrganisations(total: number = 11): MockPendingPbaOrganisation[] {
  return Array.from({ length: total }, (_unused, index) => {
    const sequence = index + 1;
    const paddedSequence = sequence.toString().padStart(2, '0');
    return createMockPendingPbaOrganisation({
      organisationIdentifier: `PBAPAGE${paddedSequence}`,
      organisationName: `${ORGANISATION_SEARCH_TERMS.pendingPbaPagination} Org ${paddedSequence}`,
      pbaNumbers: [{
        pbaNumber: `PBA61${paddedSequence}001`,
        dateCreated: new Date(`2024-04-${paddedSequence}T00:00:00.000Z`).toISOString()
      }]
    });
  });
}

export const pendingOrganisationStatusCodeScenarios: SearchStatusCodeScenario[] = [
  {
    statusCode: 401,
    expectedRedirectPath: /\/not-authorised(?:\/?|\?.*)$/,
    expectedErrorHeading: NOT_AUTHORISED_ERROR_HEADING
  },
  {
    statusCode: 500,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: SERVICE_DOWN_ERROR_HEADING
  },
  {
    statusCode: 503,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: SERVICE_DOWN_ERROR_HEADING
  }
];

export const activeOrganisationStatusCodeScenarios: SearchStatusCodeScenario[] = [
  {
    statusCode: 401,
    expectedRedirectPath: /\/not-authorised(?:\/?|\?.*)$/,
    expectedErrorHeading: NOT_AUTHORISED_ERROR_HEADING
  },
  {
    statusCode: 500,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: SERVICE_DOWN_ERROR_HEADING
  },
  {
    statusCode: 503,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: SERVICE_DOWN_ERROR_HEADING
  }
];

export const pendingPbaStatusCodeScenarios: SearchStatusCodeScenario[] = [
  {
    statusCode: 403,
    expectedRedirectPath: /\/not-authorised(?:\/?|\?.*)$/,
    expectedErrorHeading: NOT_AUTHORISED_ERROR_HEADING
  },
  {
    statusCode: 500,
    expectedRedirectPath: /\/service-down(?:\/?|\?.*)$/,
    expectedErrorHeading: SERVICE_DOWN_ERROR_HEADING
  }
];

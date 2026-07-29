import {
  createMockOrganisation,
  createMockOrganisationUser,
  createMockPendingPbaOrganisation,
  type MockOrganisation,
  type MockOrganisationUser,
  type MockPendingPbaOrganisation,
  type StandardOrganisationApprovalsApiMockState
} from '../../integration/mocks';

export const ACCESSIBILITY_VISIBLE_PAGE_ROWS = 10;
const ACCESSIBILITY_TOTAL_RECORDS = 500;

const ACCESSIBILITY_ORGANISATION_NAMES = [
  'Northgate Legal Chambers',
  'Riverside Family Law',
  'Crown Square Advocates',
  'Harbour Civil Litigation',
  'Oakfield Immigration Advice',
  'Westmere Probate Services',
  'Southbank Tribunal Support',
  'Kingsway Public Law',
  'Meadow Court Solicitors',
  'Eastbridge Legal Partners'
];

const ACCESSIBILITY_ADDRESS_FIXTURES = [
  ['11 Northgate Street', 'Legal Quarter', 'Leeds', 'West Yorkshire', 'LS1 4AB'],
  ['22 Riverside Walk', 'Suite 4', 'Bristol', 'Bristol', 'BS1 6QF'],
  ['33 Crown Square', 'Floor 7', 'Manchester', 'Greater Manchester', 'M2 5DB'],
  ['44 Harbour Road', 'Dockside', 'Liverpool', 'Merseyside', 'L3 9PP'],
  ['55 Oakfield Avenue', 'Civic Centre', 'Cardiff', 'South Glamorgan', 'CF10 3AT'],
  ['66 Westmere Lane', 'Old Town', 'Nottingham', 'Nottinghamshire', 'NG1 7DQ'],
  ['77 Southbank Place', 'County Hall', 'London', 'Greater London', 'SE1 7PB'],
  ['88 Kingsway', 'Holborn', 'London', 'Greater London', 'WC2B 6AA'],
  ['99 Meadow Court', 'Station Road', 'Cambridge', 'Cambridgeshire', 'CB1 2JW'],
  ['101 Eastbridge Street', 'Commercial District', 'Birmingham', 'West Midlands', 'B4 7XG']
];

const ACCESSIBILITY_ADMIN_FIXTURES = [
  ['Aisha', 'Rahman'],
  ['Ben', 'Morgan'],
  ['Charlotte', 'Evans'],
  ['Daniel', 'Okafor'],
  ['Elena', 'Patel'],
  ['Farah', 'Hughes'],
  ['George', 'Singh'],
  ['Hannah', 'Williams'],
  ['Isaac', 'Brown'],
  ['Joanne', 'Taylor']
];

function padRowNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function createAccessibilityOrganisation(index: number, status: 'ACTIVE' | 'PENDING' | 'REVIEW'): MockOrganisation {
  const rowNumber = padRowNumber(index);
  const address = ACCESSIBILITY_ADDRESS_FIXTURES[index % ACCESSIBILITY_ADDRESS_FIXTURES.length];
  const admin = ACCESSIBILITY_ADMIN_FIXTURES[index % ACCESSIBILITY_ADMIN_FIXTURES.length];
  const isActive = status === 'ACTIVE';

  return createMockOrganisation({
    organisationIdentifier: `${isActive ? 'A11YACTIVE' : 'A11YPEND'}${rowNumber}`,
    name: `${ACCESSIBILITY_ORGANISATION_NAMES[index % ACCESSIBILITY_ORGANISATION_NAMES.length]} ${rowNumber}`,
    status,
    companyNumber: `10${rowNumber}77${index}`,
    orgType: index % 2 === 0 ? 'SOLICITOR' : 'BARRISTER',
    sraId: `SRA88${rowNumber}`,
    contactInformation: [{
      addressLine1: address[0],
      addressLine2: address[1],
      addressLine3: `Accessibility dataset row ${rowNumber}`,
      townCity: address[2],
      county: address[3],
      postCode: address[4],
      dxAddress: [{ dxNumber: `DX ${4100 + index}`, dxExchange: address[2] }]
    }],
    superUser: {
      userIdentifier: `a11y-admin-${rowNumber}`,
      firstName: admin[0],
      lastName: admin[1],
      email: `${admin[0].toLowerCase()}.${admin[1].toLowerCase()}.${rowNumber}@example.com`
    },
    paymentAccount: isActive ? [`PBA42${rowNumber}01`, `PBA42${rowNumber}02`] : [],
    pendingPaymentAccount: isActive ? [] : [`PBA41${rowNumber}01`],
    dateReceived: isActive ? undefined : new Date(Date.UTC(2024, 5, index + 1)).toISOString(),
    dateApproved: isActive ? new Date(Date.UTC(2024, 6, index + 1)).toISOString() : undefined,
    orgAttributes: [
      { key: 'jurisdiction', value: index % 2 === 0 ? 'Family' : 'Civil' },
      { key: 'accessibilityScenario', value: `pagination-row-${rowNumber}` }
    ]
  });
}

function createAccessibilityPendingPbaOrganisation(index: number): MockPendingPbaOrganisation {
  const rowNumber = padRowNumber(index);
  const admin = ACCESSIBILITY_ADMIN_FIXTURES[index % ACCESSIBILITY_ADMIN_FIXTURES.length];
  const pbaNumbers = Array.from({ length: index % 3 === 0 ? 3 : 2 }, (_, pbaIndex) => ({
    pbaNumber: `PBA43${rowNumber}${pbaIndex + 1}`,
    dateCreated: new Date(Date.UTC(2024, 7, index + pbaIndex + 1)).toISOString()
  }));

  return createMockPendingPbaOrganisation({
    organisationIdentifier: `A11YPBA${rowNumber}`,
    organisationName: `PBA ${ACCESSIBILITY_ORGANISATION_NAMES[index % ACCESSIBILITY_ORGANISATION_NAMES.length]} ${rowNumber}`,
    superUser: {
      firstName: admin[0],
      lastName: admin[1],
      email: `pba.${admin[0].toLowerCase()}.${admin[1].toLowerCase()}.${rowNumber}@example.com`
    },
    pbaNumbers
  });
}

function createAccessibilityUser(index: number): MockOrganisationUser {
  const rowNumber = padRowNumber(index);
  const admin = ACCESSIBILITY_ADMIN_FIXTURES[index % ACCESSIBILITY_ADMIN_FIXTURES.length];

  return createMockOrganisationUser({
    userIdentifier: `a11y-user-${rowNumber}`,
    firstName: admin[0],
    lastName: `${admin[1]} ${rowNumber}`,
    email: `caseworker.${admin[0].toLowerCase()}.${admin[1].toLowerCase()}.${rowNumber}@example.com`,
    roles: index % 2 === 0
      ? ['pui-organisation-manager', 'pui-user-manager', 'pui-case-manager']
      : ['pui-finance-manager', 'pui-case-manager']
  });
}

function mapOrganisationsById(organisations: MockOrganisation[]): Record<string, MockOrganisation> {
  return organisations.reduce<Record<string, MockOrganisation>>((mappedOrganisations, organisation) => {
    mappedOrganisations[organisation.organisationIdentifier] = organisation;
    return mappedOrganisations;
  }, {});
}

const pendingOrganisations = Array.from({ length: ACCESSIBILITY_VISIBLE_PAGE_ROWS }, (_, index) =>
  createAccessibilityOrganisation(index, index > 0 && index % 4 === 0 ? 'REVIEW' : 'PENDING')
);

const activeOrganisations = Array.from({ length: ACCESSIBILITY_VISIBLE_PAGE_ROWS }, (_, index) =>
  createAccessibilityOrganisation(index, 'ACTIVE')
);

const pendingPbaOrganisations = Array.from({ length: ACCESSIBILITY_VISIBLE_PAGE_ROWS }, (_, index) =>
  createAccessibilityPendingPbaOrganisation(index)
);

const pendingPbaDetails = pendingPbaOrganisations.map((organisation) =>
  createMockOrganisation({
    organisationIdentifier: organisation.organisationIdentifier,
    name: organisation.organisationName,
    status: 'ACTIVE',
    paymentAccount: [],
    pendingPaymentAccount: organisation.pbaNumbers.map(({ pbaNumber }) => pbaNumber),
    superUser: {
      userIdentifier: `${organisation.organisationIdentifier.toLowerCase()}-admin`,
      firstName: organisation.superUser.firstName,
      lastName: organisation.superUser.lastName,
      email: organisation.superUser.email
    }
  })
);

const organisationUsers = Array.from({ length: ACCESSIBILITY_VISIBLE_PAGE_ROWS }, (_, index) =>
  createAccessibilityUser(index)
);

export const ACCESSIBILITY_PENDING_ORGANISATION_ID = pendingOrganisations[0].organisationIdentifier;

export const ACCESSIBILITY_APPROVALS_MOCK_STATE: StandardOrganisationApprovalsApiMockState = {
  organisations: {
    pendingOrganisations,
    activeOrganisations,
    singleOrganisationsById: mapOrganisationsById([
      ...pendingOrganisations,
      ...activeOrganisations,
      ...pendingPbaDetails
    ]),
    pendingSearchResponse: {
      body: {
        organisations: pendingOrganisations,
        total_records: ACCESSIBILITY_TOTAL_RECORDS
      }
    },
    activeSearchResponse: {
      body: {
        organisations: activeOrganisations,
        total_records: ACCESSIBILITY_TOTAL_RECORDS
      }
    }
  },
  pendingPbaOrganisations,
  pendingPbaSearchResponse: {
    body: {
      organisations: pendingPbaOrganisations,
      total_records: ACCESSIBILITY_TOTAL_RECORDS
    }
  },
  organisationUsers
};

import { SingleOrgSummary } from '../../org-manager/models/single-org-summary';
import { OrganisationSummary, OrganisationVM } from '../models/organisation';

export const PendingOrganisationsMockCollection2: OrganisationVM[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    addressLine1: '13 Berryfield Drive, Finglas, Dublin',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010', '271094'],
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{ dxNumber: 'BOB', dxExchange: 'Roberts' }],
    postCode: 'PC1 ABC'
  },
  {
    name: 'Siofra Moley',
    organisationId: 'Moley Limited',
    addressLine1: '45 Malachy Conlon Pk, Newry, Co. Down',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['271093'],
    admin: 'Siofra Moley',
    status: 'PENDING',
    view: 'View',
    adminEmail: 'siofra@moley.com',
    dxNumber: [{}],
    postCode: 'PC2 XYZ'
  },
  {
    name: 'Odd Name',
    organisationId: 'OddId',
    addressLine1: '666, Hades Avenue',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: null,
    admin: 'Odd Name',
    status: 'PENDING',
    view: 'View',
    adminEmail: 'odd@hades.com',
    dxNumber: null,
    postCode: 'PC3 ODD'
  }
];

export const PendingOrganisationsMockCollection1: OrganisationVM[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'ByrneLimited',
    addressLine1: '13 Berryfield drive, Finglas',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010'],
    admin: 'Glen Byrne',
    status: 'ACTIVE',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{}],
    postCode: ''
  }
  ];

export const PendingOrganisationsMockCollectionObj: OrganisationVM = {
  name: 'Glen Byrne',
  organisationId: 'ByrneLimited',
  addressLine1: '13 Berryfield drive, Finglas',
  addressLine2: '',
  townCity: '',
  county: '',
  pbaNumber: ['101010'],
  admin: 'Glen Byrne',
  status: 'ACTIVE',
  view: 'View',
  adminEmail: 'glen@byrne.com',
  dxNumber: [{}],
  postCode: ''

  };

export const LoadPbaAccountsObj = [{
    account_number: 'PBA0088487',
    account_name: 'RAY NIXON BROWN',
    credit_limit: 5000,
    available_balance: 5000,
    status: 'Deleted',
    effective_date: '2019-12-22T19:30:55.000Z'
}];

export const orgStatePending = {
 activeOrganisations: {
   orgEntities: {},
   loaded: false,
   loading: false,
   searchString: ''
 },
 pendingOrganisations: {
   orgEntities: {
     ByrneLimited: {
       name: 'Glen Byrne',
       organisationId: 'ByrneLimited',
       addressLine1: '13 Berryfield drive, Finglas',
       addressLine2: '',
       townCity: '',
       county: '',
       postCode: '',
       pbaNumber: ['101010'],
       admin: 'Glen Byrne',
       status: 'ACTIVE',
       view: 'View',
       adminEmail: 'glen@byrne.com',
       dxNumber: [{}]
     }
     },
   loaded: true,
   loading: false,
   searchString: ''
 },
 errorMessage: '',
 orgForReview: null,
 organisationUsersList: { users: null, isError: false },
 showOrganisationDetailsUserTab:  {orgId: null, showUserTab: false},
 organisationDeletable: false,
 searchString: ''
};

export const orgStateActive = {
  activeOrganisations: {
    orgEntities: {
      ByrneLimited: {
        name: 'Glen Byrne',
        organisationId: 'ByrneLimited',
        addressLine1: '13 Berryfield drive, Finglas',
        addressLine2: '',
        townCity: '',
        county: '',
        postCode: '',
        pbaNumber: ['101010'],
        admin: 'Glen Byrne',
        status: 'ACTIVE',
        view: 'View',
        adminEmail: 'glen@byrne.com',
        dxNumber: [{}]
      }
    },
    loaded: true,
    loading: false,
    searchString: ''
  },
  pendingOrganisations: {
    orgEntities: {},
    loaded: false,
    loading: false,
    searchString: ''
  },
  errorMessage: '',
  orgForReview: null,
  organisationUsersList: { users: null, isError: false },
  showOrganisationDetailsUserTab:  {orgId: null, showUserTab: false},
  organisationDeletable: false,
  searchString: ''
};

export const PendingOrganisationsMockSummaryCollection1: OrganisationSummary[] = [
  {
    name: 'GlenByrne',
    organisationId: 'ByrneLimited',
    addressLine1: '13 Berryfield drive, Finglas',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010'],
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    routerLink: '/pending-organisations/organisation/101010/',
    dxNumber: [{}],
    postCode: ''
  }
];

export const ReviewedOrganisationMockCollection: OrganisationVM[] = [{
  name: 'dummy 1',
  organisationId: 'dummy 1',
  addressLine1: 'dummy 1',
  addressLine2: '',
  townCity: '',
  county: '',
  pbaNumber: ['dummy 1'],
  admin: 'dummy 1',
  status: 'dummy 1',
  view: 'dummy 1',
  adminEmail: 'dummy 1',
  dxNumber: [{}],
  postCode: ''
}];

export const ActiveOrganisationMockCollection: OrganisationVM[] = [{
  name: 'dummy 1',
  organisationId: 'dummy 1',
  addressLine1: 'dummy 1',
  addressLine2: '',
  townCity: '',
  county: '',
  pbaNumber: ['dummy 1'],
  admin: 'dummy 1',
  status: 'dummy 1',
  view: 'dummy 1',
  adminEmail: 'dummy 1',
  dxNumber: [{}],
  postCode: ''
}];

export const ReviewedOrganisationFromGovTableMockCollection: any[] = [{
  input: {
    name: 'dummy 1',
    organisationId: 'dummy 1',
    address: 'dummy 1',
    pbaNumber: ['dummy 1'],
    admin: 'dummy 1',
    status: 'dummy 1',
    view: 'dummy 1',
    adminEmail: 'dummy 1',
    dxNumber: [{}],
    postCode: ''
  }
}];


export const SingleOrgSummaryMock: SingleOrgSummary = {
  status: 'Active',
  effective_date: '22/10/2022',
  dx_exchange: '',
  name: 'Speak Limited',
  address: '72 Guild Street, London, SE23 6FH',
  pbaNumber: 'SU2DSCSA',
  dxNumber: '12345567',
  dxExchange: '7654321',
  admin: 'Matt Speak'
};

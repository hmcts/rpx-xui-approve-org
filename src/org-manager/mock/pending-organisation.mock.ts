import { SingleOrgSummary } from '../../org-manager/models/single-org-summary';
import { OrganisationSummary, OrganisationVM } from '../models/organisation';

export const pendingOrganisationsMockCollection2: OrganisationVM[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    addressLine1: '13 Berryfield Drive, Finglas, Dublin',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010'],
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{}]
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
    dxNumber: [{}]
  }
];

export const pendingOrganisationsMockCollection1: OrganisationVM[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    addressLine1: '13 Berryfield drive, Finglas',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010'],
    admin: 'Glen Byrne',
    status: 'ACTIVE',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{}]
  }
];

export const pendingOrganisationsMockSummaryCollection1: OrganisationSummary[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
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
    dxNumber: [{}]
  }
];

export const reviewedOrganisationMockCollection: OrganisationVM[] = [{
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
  dxNumber: [{}]
}];

export const activeOrganisationMockCollection: OrganisationVM[] = [{
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
  dxNumber: [{}]
}];

export const reviewedOrganisationFromGovTableMockCollection: any[] = [{
  input: {
    name: 'dummy 1',
    organisationId: 'dummy 1',
    address: 'dummy 1',
    pbaNumber: ['dummy 1'],
    admin: 'dummy 1',
    status: 'dummy 1',
    view: 'dummy 1',
    adminEmail: 'dummy 1',
    dxNumber: [{}]
  }
}];


export const singleOrgSummaryMock: SingleOrgSummary = {
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

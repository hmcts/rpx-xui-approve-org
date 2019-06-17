import { PendingOrganisation, PendingOrganisationSummary } from '../models/pending-organisation';
import { SingleOrgSummary } from '../../org-manager/models/single-org-summary';

export const PendingOrganisationsMockCollection2: PendingOrganisation[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    address: '13 Berryfield Drive, Finglas, Dublin',
    pbaNumber: '101010',
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    id: '2424242',
    email: 'glen@byrne.com'
  },
  {
    name: 'Siofra Moley',
    organisationId: 'Moley Limited',
    address: '45 Malachy Conlon Pk, Newry, Co. Down',
    pbaNumber: '271093',
    admin: 'Siofra Moley',
    status: 'PENDING',
    view: 'View',
    id: '343434',
    email: 'siofra@moley.com'
  }
];

export const PendingOrganisationsMockCollection1: PendingOrganisation[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    address: '13 Berryfield drive, Finglas',
    pbaNumber: '101010',
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    id: '2424242',
    email: 'glen@byrne.com'
  }
];

export const PendingOrganisationsMockSummaryCollection1: PendingOrganisationSummary[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    address: '13 Berryfield drive, Finglas',
    pbaNumber: '101010',
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    id: '2424242',
    email: 'glen@byrne.com',
    routerLink: '/pending-organisations/organisation/101010/'
  }
];

export const ReviewedOrganisationMockCollection: PendingOrganisation[] = [{
  name: 'dummy 1',
  organisationId: 'dummy 1',
  address: 'dummy 1',
  pbaNumber: 'dummy 1',
  admin: 'dummy 1',
  status: 'dummy 1',
  view: 'dummy 1',
  id: 'dummy 1',
  email: 'dummy 1'
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

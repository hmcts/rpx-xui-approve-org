import { PendingOrganisation } from '../models/pending-organisation';

export const PendingOrganisationsMock: PendingOrganisation[] = [
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

import { PendingOrganisation } from '../models/pending-organisation';

export const PendingOrganisationsMock: PendingOrganisation[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    address: '13 Berryfield drive, Finglas',
    pbaNumber: '101010',
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View'
  },
  {
    name: 'Siofra Moley',
    organisationId: 'Moley Limited',
    address: '45 Malachy',
    pbaNumber: '271093',
    admin: 'Siofra Moley',
    status: 'PENDING',
    view: 'View'
  }
];

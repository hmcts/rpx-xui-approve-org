import MockAdapter from 'axios-mock-adapter';

import { httpMock } from '../common/httpMock';
import { OrganisationModel, PBANumberModel } from './models';

function toOrg(organisationIdentifier: string): OrganisationModel {
  const org = MOCK_ORGS[organisationIdentifier];
  if (org) {
    return {
      organisationIdentifier,
      pbaNumbers: org.pbas.map((pba: any) => toPBA(pba)),
      status: org.status
    };
  }
  return null;
}

function toPBA(pbaNumber: string): PBANumberModel {
  const pba = MOCK_PBAS[pbaNumber];
  if (pba) {
    return {
      dateAccepted: pba.accepted,
      dateCreated: pba.created,
      pbaNumber: `PBA${pbaNumber}`,
      status: pba.status,
      statusMessage: pba.statusMessage
    };
  }
  return undefined;
}

function filterByStatus(orgs: OrganisationModel[], status: string): OrganisationModel[] {
  if (orgs) {
    const filtered: OrganisationModel[] = [];
    orgs.forEach(org => {
      const pbaNumbers = (org.pbaNumbers || []).filter(pbaNumber => pbaNumber.status === status);
      if (pbaNumbers.length > 0) {
        filtered.push({
          ...org,
          pbaNumbers
        });
      }
    });
    return filtered;
  }
  return orgs;
}

function getTimestamp(): string {
  const d = new Date();
  const date = `${padZero(d.getDate(), 2)}-${padZero(d.getMonth() + 1, 2)}-${d.getFullYear()}`;
  const time = `${d.toLocaleTimeString()}.${d.getMilliseconds()}`;
  return `${date} ${time}`;
}

function padZero(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

const MOCK_PBAS = {
  '1111111': { status: 'accepted', created: '10-10-2020 11:27:00.000', accepted: '05-05-2021 11:27:00.001' },
  '2222222': { status: 'accepted', created: '09-09-2020 11:27:00.002', accepted: '05-05-2021 11:27:00.003' },
  '3333333': { status: 'accepted', created: '08-08-2020 11:27:00.004', accepted: '05-05-2021 11:27:00.005' },
  '4444444': { status: 'pending', created: '05-06-2020 11:27:00.006' },
  '5555555': { status: 'pending', created: '06-05-2020 11:27:00.008' },
  '6666666': { status: 'pending', created: '05-05-2020 11:27:00.010' },
  '7777777': { status: 'pending', created: '04-04-2020 11:27:00.012' },
  '8888888': { status: 'pending', created: '03-03-2020 11:27:00.014' },
  '9999999': { status: 'pending', created: '02-02-2021 11:27:00.016' }
};

const MOCK_ORGS = {
  '13NGXCM': { status: 'active', pbas: [ '1111111', '4444444', '5555555' ] },
  'FSHKY34': { status: 'active', pbas: [ '6666666', '7777777', '8888888', '9999999' ] },
  'MW6LH3X': { status: 'active', pbas: [ '2222222', '3333333' ] }
};

export const init = () => {
  const mock = new MockAdapter(httpMock);

  const GET_BY_STATUS_URL = '/refdata/internal/v1/organisations/pba';
  const ALL_ORGS = [ toOrg('13NGXCM'), toOrg('MW6LH3X'), toOrg('FSHKY34') ];

  // Set up the various scenarios to be mocked.
  // Get PBAs by status.
  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/pending`)).reply(() => {
    const response = filterByStatus(ALL_ORGS, 'pending');
    return [ 200, response ];
  });

  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/empty`)).reply(() => {
    return [ 200, [] ];
  });

  /**
   * Simulated errors.
   */
  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/400`)).reply(() => {
    return [ 400, {
      errorDescription: 'PBA status is not valid',
      errorMessage: 'PBA status is not valid',
      timestamp: getTimestamp()
    }];
  });
  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/401`)).reply(401);
  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/403`)).reply(403);
  mock.onGet(new RegExp(`${GET_BY_STATUS_URL}/500`)).reply(() => {
    return [ 500, {
      errorDescription: 'I played with your heart, got lost in the game',
      errorMessage: 'Oops, I did it again',
      timestamp: getTimestamp()
    }];
  });
};

import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { Organisation } from '../models/organisation';
import { PendingOrganisationService } from './pending-organisation.service';

describe('PendingOrganisationService', () => {
  let httpClient: HttpClient;
  let pendingOrganisationService: PendingOrganisationService;

  const mockEnviroment = {
    singleOrgUrl: 'single-org-url',
    orgPendingUrl: 'org-pending-url',
    orgApprovePendingUrl: 'org-approve-pending-url'
  };

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        PendingOrganisationService,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnviroment },
      ]
    });
    pendingOrganisationService = TestBed.get(PendingOrganisationService);
    pendingOrganisationService.orgPendingUrl = mockEnviroment.orgPendingUrl;
    pendingOrganisationService.singleOrgUrl = mockEnviroment.singleOrgUrl;
    pendingOrganisationService.orgApprovePendingUrl = mockEnviroment.orgApprovePendingUrl;

  });

  it('should fetch pending organisations', () => {
    pendingOrganisationService.fetchPendingOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(mockEnviroment.orgPendingUrl);
  });

  it('should get single organisation', () => {
    pendingOrganisationService.getSingleOrganisation({id: 'dummy'});
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnviroment.singleOrgUrl}dummy`);
  });

  it('should approve organisation', () => {
    const organisation: Organisation = {
      organisationIdentifier: '',
      contactInformation: [{
        addressLine1: '',
        addressLine2: '',
        townCity: 'string',
        county: 'string',
        postCode: 'string',
        dxAddress: [{
          dxNumber: 'string',
          dxExchange: 'string',
        }],
      }],
      superUser: {
        userIdentifier: '',
        firstName: 'string',
        lastName: 'string;',
        email: 'string',
      },
      status: 'string;',
      name: 'string;',
      paymentAccount: [{}]
    };
    pendingOrganisationService.approvePendingOrganisations(organisation);
    expect(httpClient.put).toHaveBeenCalledWith(mockEnviroment.orgApprovePendingUrl, organisation);
  });
});

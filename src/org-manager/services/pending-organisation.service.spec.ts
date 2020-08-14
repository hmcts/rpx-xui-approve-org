import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { Organisation } from '../models/organisation';
import { PendingOrganisationService } from './pending-organisation.service';

describe('PendingOrganisationService', () => {
  let httpClient: HttpClient;
  let pendingOrganisationService: PendingOrganisationService;

  const mockEnvironment = {
    singleOrgUrl: 'single-org-url?id=',
    orgPendingUrl: 'org-pending-url',
    organisationsUrl: 'organisations-url/'
  };

  const organisation: Organisation = {
    organisationIdentifier: 'abc',
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

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        PendingOrganisationService,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnvironment },
      ]
    });
    pendingOrganisationService = TestBed.get(PendingOrganisationService);
    pendingOrganisationService.orgPendingUrl = mockEnvironment.orgPendingUrl;
    pendingOrganisationService.singleOrgUrl = mockEnvironment.singleOrgUrl;
    pendingOrganisationService.organisationsUrl = mockEnvironment.organisationsUrl;

  });

  it('should fetch pending organisations', () => {
    pendingOrganisationService.fetchPendingOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(mockEnvironment.orgPendingUrl);
  });

  it('should get single organisation', () => {
    pendingOrganisationService.getSingleOrganisation({id: 'dummy'});
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnvironment.singleOrgUrl}dummy`);
  });

  it('should approve organisation', () => {
    pendingOrganisationService.approvePendingOrganisations(organisation);
    expect(httpClient.put).toHaveBeenCalledWith(`${mockEnvironment.organisationsUrl}abc`, organisation);
  });

  it('should delete organisation', () => {
    pendingOrganisationService.deletePendingOrganisations(organisation);
    expect(httpClient.delete).toHaveBeenCalledWith(`${mockEnvironment.organisationsUrl}abc`);
  });
});

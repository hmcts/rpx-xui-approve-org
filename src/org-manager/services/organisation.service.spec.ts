import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { Organisation } from '../models/organisation';
import { OrganisationService } from './organisation.service';

describe('OrganisationService', () => {
  let httpClient: HttpClient;
  let organisationService: OrganisationService;

  const mockEnvironment = {
    singleOrgUrl: 'single-org-url',
    orgActiveUrl: 'org-active-url',
    orgUsersUrl: 'org-users-url?id=',
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
        dxExchange: 'string'
      }]
    }],
    superUser: {
      userIdentifier: '',
      firstName: 'string',
      lastName: 'string;',
      email: 'string'
    },
    status: 'string;',
    name: 'string;',
    pendingPaymentAccount: [{}],
    paymentAccount: [{}],
    orgAttributes: [{ key: 'AAA7', value: 'Damages' }]
  };

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        OrganisationService,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnvironment }
      ]
    });
    organisationService = TestBed.inject(OrganisationService);
    organisationService.orgActiveUrl = mockEnvironment.orgActiveUrl;
    organisationService.singleOrgUrl = mockEnvironment.singleOrgUrl;
    organisationService.orgUsersUrl = mockEnvironment.orgUsersUrl;
    organisationService.organisationsUrl = mockEnvironment.organisationsUrl;
  });

  it('should fetch active organisations', () => {
    organisationService.fetchOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(mockEnvironment.orgActiveUrl);
  });

  it('should get single organisation', () => {
    organisationService.getSingleOrganisation({ id: 'dummy' });
    expect(httpClient.get).toHaveBeenCalled();
  });

  it('should get organisation user list', () => {
    organisationService.getOrganisationUsers('mockId', 1);
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnvironment.orgUsersUrl}mockId&page=1`);
  });

  it('should delete organisation', () => {
    organisationService.deleteOrganisation(organisation);
    expect(httpClient.delete).toHaveBeenCalledWith(`${mockEnvironment.organisationsUrl}abc`);
  });

  it('should get organisation deletable status', () => {
    organisationService.getOrganisationDeletableStatus('abc123');
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnvironment.organisationsUrl}abc123/isDeletable`);
  });
});

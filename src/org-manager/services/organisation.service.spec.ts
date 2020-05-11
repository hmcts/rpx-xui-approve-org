import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { Organisation } from '../models/organisation';
import { OrganisationService } from './organisation.service';

describe('OrganisationService', () => {
  let httpClient: HttpClient;
  let organisationService: OrganisationService;

  const mockEnviroment = {
    singleOrgUrl: 'single-org-url',
    orgActiveUrl: 'org-pending-url',
    orgUsersUrl: 'org-approve-pending-url'
  };

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        OrganisationService,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnviroment },
      ]
    });
    organisationService = TestBed.get(OrganisationService);
    organisationService.orgActiveUrl = mockEnviroment.orgActiveUrl;
    organisationService.singleOrgUrl = mockEnviroment.singleOrgUrl;
    organisationService.orgUsersUrl = mockEnviroment.orgUsersUrl;

  });

  it('should fetch active organisations', () => {
    organisationService.fetchOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(mockEnviroment.orgActiveUrl);
  });

  it('should get single organisation', () => {
    organisationService.getSingleOrganisation({id: 'dummy'});
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnviroment.singleOrgUrl}dummy`);
  });

  it('should get organisation user list', () => {
    organisationService.getOrganisationUsers('mockId');
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnviroment.orgUsersUrl}mockId`);
  });
});

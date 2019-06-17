import { TestBed } from '@angular/core/testing';
import { PendingOrganisationService } from './pending-organisation.service';
import { HttpClient } from '@angular/common/http';
import createSpyObj = jasmine.createSpyObj;
import { environment } from 'src/environments/environment';

describe('PendingOrganisationService', () => {
  let httpClient: HttpClient;
  let pendingOrganisationService: PendingOrganisationService;

  beforeEach(() => {

    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        PendingOrganisationService,
        { provide: HttpClient, useValue: httpClient },
      ]
    });

    pendingOrganisationService = TestBed.get(PendingOrganisationService);
  });

  it('should fetch pending organisations', () => {
    pendingOrganisationService.fetchPendingOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(environment.orgPendingUrl);
  });

  it('should get single organisation', () => {
    pendingOrganisationService.getSingleOrganisation({id: 'dummy'});
    expect(httpClient.get).toHaveBeenCalledWith(environment.singleOrgUrl + 'dummy');
  });

  it('should approve organisation', () => {
    pendingOrganisationService.approvePendingOrganisations('dummy');
    expect(httpClient.put).toHaveBeenCalledWith(environment.orgApprovePendingUrl, 'dummy');
  });



});

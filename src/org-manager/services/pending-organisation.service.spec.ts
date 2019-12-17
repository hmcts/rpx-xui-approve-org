import { TestBed } from '@angular/core/testing';
import { PendingOrganisationService } from './pending-organisation.service';
import { HttpClient } from '@angular/common/http';
import createSpyObj = jasmine.createSpyObj;
import { environment } from 'src/environments/environment';
import { Organisation } from '../models/organisation';

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

  xit('should fetch pending organisations', () => {
    pendingOrganisationService.fetchPendingOrganisations();
    expect(httpClient.get).toHaveBeenCalledWith(environment.orgPendingUrl);
  });

  xit('should get single organisation', () => {
    pendingOrganisationService.getSingleOrganisation({id: 'dummy'});
    expect(httpClient.get).toHaveBeenCalledWith(environment.singleOrgUrl + 'dummy');
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
    expect(httpClient.put).toHaveBeenCalledWith(environment.orgApprovePendingUrl, organisation);
  });



});

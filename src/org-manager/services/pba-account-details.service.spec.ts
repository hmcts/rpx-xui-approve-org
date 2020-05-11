import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { PbaAccountDetails } from './pba-account-details.services';

describe('PbaAccountDetails', () => {
  let httpClient: HttpClient;
  let pbaAccountDetails: PbaAccountDetails;

  const mockEnviroment = {
    updatePbaUrl: 'pba-account-details-url'
  };

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        PbaAccountDetails,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnviroment },
      ]
    });
    pbaAccountDetails = TestBed.get(PbaAccountDetails);
    pbaAccountDetails.updatePbaUrl = mockEnviroment.updatePbaUrl;

  });

  it('should get organisation user list', () => {
    pbaAccountDetails.getAccountDetails('mockId');
    expect(httpClient.get).toHaveBeenCalledWith(`${mockEnviroment.updatePbaUrl}/?accountNames=mockId`);
  });
});

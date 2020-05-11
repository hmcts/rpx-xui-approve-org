import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import createSpyObj = jasmine.createSpyObj;
import { UpdatePbaServices } from './update-pba.services';

describe('UpdatePbaServices', () => {

  let httpClient: HttpClient;
  let updatePbaServices: UpdatePbaServices;

  const mockEnviroment = {
    updatePbaUrl: 'pba-account-details-url'
  };

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        UpdatePbaServices,
        { provide: HttpClient, useValue: httpClient },
        { provide: environment, useValue: mockEnviroment },
      ]
    });
    updatePbaServices = TestBed.get(UpdatePbaServices);
    updatePbaServices.updatePbaUrl = mockEnviroment.updatePbaUrl;

  });

  it('should get organisation user list', () => {
    updatePbaServices.updatePba('mockId');
    expect(httpClient.put).toHaveBeenCalledWith(mockEnviroment.updatePbaUrl, 'mockId');
  });
});

import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { PbaService } from './pba.service';

import createSpyObj = jasmine.createSpyObj;

describe('PbaService', () => {

  const PBA_URL: string = environment.pbaUrl;
  let httpClient: HttpClient;
  let service: PbaService;

  beforeEach(() => {
    httpClient = createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        PbaService,
        { provide: HttpClient, useValue: httpClient }
      ]
    });
    service = TestBed.get(PbaService);
  });

  describe('getPBAsByStatus', () => {
    it('should include the environment variable and status parameter in a get request', () => {
      const STATUS = 'pending';
      service.getPBAsByStatus(STATUS);
      expect(httpClient.get).toHaveBeenCalledWith(`${PBA_URL}/status/${STATUS}`);
    });
    it('should allow a nonsense status and pass it on to a get request', () => {
      const STATUS = 'bob';
      service.getPBAsByStatus(STATUS);
      expect(httpClient.get).toHaveBeenCalledWith(`${PBA_URL}/status/${STATUS}`);
    });
  });

  describe('setPBAStatus', () => {
    it('should include the environment variable and body in a put request', () => {
      const BODY = { id: 'bob', status: 'approved' };
      service.setPBAStatus(BODY);
      expect(httpClient.put).toHaveBeenCalledWith(`${PBA_URL}/status`, BODY);
    });
  });
});

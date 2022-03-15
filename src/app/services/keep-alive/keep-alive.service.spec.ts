import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LogOutKeepAliveService } from './keep-alive.service';

describe('KeepAliveService', () => {
  let httpTestingController: HttpTestingController;
  let kaService: LogOutKeepAliveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ LogOutKeepAliveService ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    kaService = TestBed.inject(LogOutKeepAliveService);
  });

  it('Calls correct endpoint on logout', () => {
    const testData= {};

    kaService.logOut().subscribe(data => expect(data).toEqual(testData));

    const req = httpTestingController.expectOne('auth/logout?noredirect=true');
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
    httpTestingController.verify();
  });

  it('Calls correct endpoint on heartbeat', () => {
    const testData= {};

    kaService.heartBeat().subscribe(data => expect(data).toEqual(testData));

    const req = httpTestingController.expectOne('auth/keepalive');
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
    httpTestingController.verify();
  });
});

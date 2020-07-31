import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { LogOutKeepAliveService } from './keep-alive.service';


describe('LogOutKeepAliveService', () => {

  let service: LogOutKeepAliveService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogOutKeepAliveService],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(LogOutKeepAliveService);
    httpController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct endpoint on logout', () => {
    service.logOut().subscribe(() => {});
    const req = httpController.expectOne('auth/logout?noredirect=true');
    req.flush(null);
  });

  it('should call correct endpoint on heartbeat', () => {
    service.heartBeat().subscribe(() => {});
    const req = httpController.expectOne('auth/keepalive');
    req.flush(null);
  });
});

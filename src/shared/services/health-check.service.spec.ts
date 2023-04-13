import { HttpClient } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HealthCheckService } from './health-check.service';

describe('HealthCheckService', () => {
  const mockedValue = 'dummy';
  const storeSubjectMock = new BehaviorSubject(mockedValue);
  const mockedStore = {
    pipe: () => storeSubjectMock.asObservable(),
  };

  const httpClientMock = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        HealthCheckService,
        { provide: HttpClient, useValue: httpClientMock },
        { provide: Store, useValue: mockedStore }
      ]
    });
  });

  it('should be created', inject([HealthCheckService], (service: HealthCheckService) => {
    expect(service).toBeTruthy();
  }));

  describe('doHealthCheck', () => {
    it('should query health state', inject([HealthCheckService], (service: HealthCheckService) => {
      service.doHealthCheck();
      expect(httpClientMock.get).toHaveBeenCalledWith('/api/healthCheck?path=dummy');
    }));
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from route subscription', inject([HealthCheckService], (service: HealthCheckService) => {
      service.routeSubscription = new Subscription();
      service.ngOnDestroy();

      expect(service.routeSubscription.closed).toBeTruthy();
    }));

    it('should do nothing if subscription undefined', inject([HealthCheckService], (service: HealthCheckService) => {
      service.routeSubscription = undefined;
      service.ngOnDestroy();

      expect(service.routeSubscription).toBeUndefined();
    }));
  });
});

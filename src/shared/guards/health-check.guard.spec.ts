import { HttpClient } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { HealthCheckService } from '../services/health-check.service';
import { HealthCheckGuard } from './health-check.guard';

class HttpClientMock {
  public get() {
    return of('response');
  }
}

class HealthCheckServiceMock {
  public withError: boolean = false;
  public healthy: any = {
    healthState: false
  };

  public doHealthCheck() {
    if (this.withError) {
      return throwError('An error');
    }

    return of(this.healthy);
  }
}

describe('HealthCheckGuard', () => {
  let healthService: HealthCheckServiceMock;

  beforeEach(() => {
    healthService = new HealthCheckServiceMock();

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({})
      ],
      providers: [
        HealthCheckGuard,
        { provide: HealthCheckService, useValue: healthService },
        { provide: HttpClient, useClass: HttpClientMock }
      ]
    });
  });

  it('should exist', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
    expect(guard).toBeTruthy();
  }));

  describe('checkHealth()', () => {
    it('returns false when unhealthy', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
      healthService.healthy = false;

      guard.checkHealth().subscribe((result) => expect(result).toBeFalsy());
    }));

    it('returns true when healthy', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
      healthService.healthy = true;

      guard.checkHealth().subscribe((result) => expect(result).toBeTruthy());
    }));
  });

  describe('canActivate()', () => {
    it('returns true when healthy', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
      healthService.healthy = {
        healthState: true
      };

      guard.canActivate().subscribe((result) => expect(result).toBeTruthy());
    }));

    it('returns false when unhealthy', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
      healthService.healthy = {
        healthState: false
      };

      guard.canActivate().subscribe((result) => expect(result).toBeFalsy());
    }));

    it('returns false when error raised', inject([HealthCheckGuard], (guard: HealthCheckGuard) => {
      healthService.withError = true;
      healthService.healthy = {
        healthState: true
      };

      guard.canActivate().subscribe((result) => expect(result).toBeFalsy());
    }));
  });
});

import { TestBed } from '@angular/core/testing';
import { HealthCheckGuard } from './health-check.guard';
import { Store, StoreModule } from '@ngrx/store';
import { HealthCheckService } from '../services/health-check.service';
import { HttpClient } from '@angular/common/http';
import * as fromRoot from '../../app/store';
import { of, throwError } from 'rxjs';

class HttpClientMock {

    get() {
        return 'response';
    }
}

describe('HealthCheckGuard', () => {
    let healthCheckService: HealthCheckService;
    let healthCheckGuard: HealthCheckGuard;
    let store: Store<fromRoot.State>;
    let storeDispatchSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({})
            ],
            providers: [
                HealthCheckGuard,
                HealthCheckService,
                { provide: HttpClient, useClass: HttpClientMock }
            ]
        });

        healthCheckService = TestBed.inject(HealthCheckService);
        healthCheckGuard = TestBed.inject(HealthCheckGuard);
        store = TestBed.inject(Store);
        storeDispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    });

    it('should exist', () => {
        expect(healthCheckGuard).toBeTruthy();
    });

    it('should return health state when it is present and call through', () => {
        spyOn(healthCheckService, 'doHealthCheck').and.returnValue(of({ healthState: true }));

        healthCheckGuard.canActivate().subscribe(canActivate => {
            expect(canActivate).toBeTrue();
            expect(storeDispatchSpy).not.toHaveBeenCalled();
        });
    });
    
    it('should redirect to service down when health state is false', () => {
        spyOn(healthCheckService, 'doHealthCheck').and.returnValue(of({ healthState: false }));

        healthCheckGuard.canActivate().subscribe(canActivate => {
            expect(canActivate).toBeFalse();
            expect(storeDispatchSpy).toHaveBeenCalled();
        });
    });

    it('should redirect to service down when health check throws exception', () => {
        spyOn(healthCheckService, 'doHealthCheck').and.returnValue(throwError(() => new Error('Health check went wrong!')));

        healthCheckGuard.canActivate().subscribe(canActivate => {
            expect(canActivate).toBeFalse();
            expect(storeDispatchSpy).toHaveBeenCalled();
        });
    });

});

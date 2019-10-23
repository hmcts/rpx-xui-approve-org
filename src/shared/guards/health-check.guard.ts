import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as fromRoot from '../../app/store';
import { HealthCheckService, HealthState } from '../services/health-check.service';


@Injectable()
export class HealthCheckGuard implements CanActivate {
    constructor(
        private readonly _healthCheck: HealthCheckService,
        private readonly _store: Store<fromRoot.State>,
    ) {
    }

    public canActivate(): Observable<boolean> {
        return this._checkHealth().pipe(
            switchMap((res: HealthState) => {
                const state = res.healthState;
                if (!state) {
                    this._redirectToServiceDownPage();
                }
                return of(res.healthState);
            }),
            catchError(() => {
                this._redirectToServiceDownPage();
                return of(false);
            })
        );
    }

    private _checkHealth(): Observable<HealthState> {
        return this._healthCheck.doHealthCheck();
    }

    private _redirectToServiceDownPage() {
        this._store.dispatch(new fromRoot.Go({ path: ['/service-down'] }));
    }
}


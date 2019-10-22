import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import * as fromRoot from '../../app/store';

export interface HealthState {
    healthState: boolean;
}

@Injectable()
export class HealthCheckService implements OnDestroy {

    private _routeSubscription: Subscription;

    constructor(
        private _http: HttpClient,
        private _store: Store<fromRoot.State>,
    ) { }

    doHealthCheck(): Observable<HealthState> {
        const healthState: boolean = true;
        const result: HealthState = { healthState };
        let path = '';

        this._routeSubscription = this._store.pipe(
            select(fromRoot.getRouterUrl)
        ).subscribe(value => {
            path = value;
        });

        const encodedPath = encodeURIComponent(path);

        return path ?
            this._http.get<HealthState>(`/api/healthCheck?path=${encodedPath}`) :
            of(result);
    }

    ngOnDestroy() {
        if (this._routeSubscription) {
            this._routeSubscription.unsubscribe();
        }
    }

}

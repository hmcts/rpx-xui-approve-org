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

    private routeSubscription: Subscription;

    constructor(
        private readonly http: HttpClient,
        private readonly store: Store<fromRoot.State>,
    ) { }

    public doHealthCheck(): Observable<HealthState> {
        const healthState: boolean = true;
        const result: HealthState = { healthState };
        let path = '';

        this.routeSubscription = this.store.pipe(
            select(fromRoot.getRouterUrl)
        ).subscribe(value => {
            path = value;
        });

        const encodedPath = encodeURIComponent(path);

        return path ?
            this.http.get<HealthState>(`/api/healthCheck?path=${encodedPath}`) :
            of(result);
    }

    public ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }

}

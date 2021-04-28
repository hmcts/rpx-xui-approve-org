import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as fromRoot from '../../app/store';
import { Store, select } from '@ngrx/store';

@Injectable()
export class HealthCheckService implements OnDestroy {
	routeSubscription: Subscription;

	constructor(private readonly http: HttpClient, private readonly store: Store<fromRoot.State>) {}

	doHealthCheck(): Observable<any> {
		const healthState = true;
		const result: { healthState } = { healthState };
		let path = '';

		this.routeSubscription = this.store.pipe(select(fromRoot.getRouterUrl)).subscribe((value) => {
			path = value;
		});

		return path ? this.http.get('/api/healthCheck?path=' + encodeURIComponent(path)) : of(result);
	}

	ngOnDestroy() {
		if (this.routeSubscription) {
			this.routeSubscription.unsubscribe();
		}
	}
}

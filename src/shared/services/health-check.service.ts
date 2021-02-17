import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import * as fromRoot from '../../app/store';

@Injectable()
export class HealthCheckService implements OnDestroy {
  routeSubscription: Subscription;

  constructor(private http: HttpClient, private store: Store<fromRoot.State>) {}

  doHealthCheck(): Observable<any> {
    const healthState: boolean = true;
    const result: { healthState } = { healthState };
    let path = '';

    this.routeSubscription = this.store
      .pipe(select(fromRoot.getRouterUrl))
      .subscribe((value) => {
        path = value;
      });

    return path
      ? this.http.get('/api/healthCheck?path=' + encodeURIComponent(path))
      : of(result);
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}

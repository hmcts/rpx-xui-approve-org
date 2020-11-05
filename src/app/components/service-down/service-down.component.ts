import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GlobalError } from 'src/app/store/reducers/app.reducer';
import * as fromAppStore from '../../../app/store';

@Component({
    selector: 'app-service-down',
    templateUrl: './service-down.component.html'
})
export class ServiceDownComponent implements OnInit, OnDestroy {
    public currentError: GlobalError;
    private subscription: Subscription;
    constructor(private readonly store: Store<fromAppStore.State>) {
    }
    public ngOnDestroy(): void {
        this.store.dispatch(new fromAppStore.ClearGlobalError());
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    public ngOnInit(): void {
        this.currentError = {
            errors: [{bodyText: 'Try again later.', urlText: null, url: null}],
            header: 'Sorry, there is a problem with the service'
        };
        this.subscription = this.store.pipe(select(fromAppStore.getCurrentError))
        .subscribe(error => {
            if (error) {
                this.currentError = error;
            }
        });
    }
}

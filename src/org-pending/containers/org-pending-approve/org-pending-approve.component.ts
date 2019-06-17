import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './org-pending-approve.component.html'
})
export class OrgPendingApproveComponent implements OnInit, OnDestroy {

    reviewedOrgs$: any;
    reviewedOrganisations: PendingOrganisation[];
    reviewedOrganisationsSubscription: Subscription;

    constructor(
        private store: Store<fromOrganisationPendingStore.PendingOrganisationState>
    ) { }

    ngOnInit() {
        this.reviewedOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations));
        this.reviewedOrganisationsSubscription = this.reviewedOrgs$.subscribe(response => {
            if (response.reviewedOrganisations) {
                this.reviewedOrganisations = response.reviewedOrganisations;
            } else {
                this.onGoBack();
            }
        });
    }

    onGoBack() {
        this.store.dispatch(new fromRoot.Back());
    }

    onApproveOrganisations() {

        const payload: PendingOrganisation[] = [];

        for (let i = 0; i < this.reviewedOrganisations.length; i++) {
            payload.push(Object.assign({}, this.reviewedOrganisations[i], {
                status: 'ACTIVE'
            }));
        }
        this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(payload));
    }

    ngOnDestroy() {
        this.reviewedOrganisationsSubscription.unsubscribe();
    }
}

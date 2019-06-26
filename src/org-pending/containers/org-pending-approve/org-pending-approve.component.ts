import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PendingOrganisation } from 'src/org-manager/models/pending-organisation';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './org-pending-approve.component.html'
})
export class OrgPendingApproveComponent implements OnInit, OnDestroy {
    reviewedOrganisations: PendingOrganisation[];
    $reviewedOrganisationsSubscription: Subscription;

    constructor(
        private store: Store<fromOrganisationPendingStore.PendingOrganisationState>
    ) { }

    ngOnInit() {
        this.$reviewedOrganisationsSubscription = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations)) // TODO: should get reviewedOrganisations
        .subscribe((response: any) => { // TODO: should have correct type
            if (response.reviewedOrganisations.length > 0) {
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
        this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(this.reviewedOrganisations));
    }

    ngOnDestroy() {
        this.$reviewedOrganisationsSubscription.unsubscribe();
    }
}

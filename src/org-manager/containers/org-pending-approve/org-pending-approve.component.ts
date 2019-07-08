import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './org-pending-approve.component.html'
})
export class OrgPendingApproveComponent implements OnInit, OnDestroy {
    reviewedOrganisations: OrganisationVM[];
    $reviewedOrganisationsSubscription: Subscription;

    constructor(
        private store: Store<fromOrganisationPendingStore.OrganisationState>
    ) { }

    ngOnInit() {
        // TODO: should get reviewedOrganisations
        this.$reviewedOrganisationsSubscription = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations))
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

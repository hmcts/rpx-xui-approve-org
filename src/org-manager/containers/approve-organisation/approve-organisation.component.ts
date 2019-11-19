import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './approve-organisation.component.html'
})
export class ApproveOrganisationComponent implements OnInit, OnDestroy {
    reviewedOrganisations: OrganisationVM[];
    $reviewedOrganisationsSubscription: Subscription;
    serverResponseMessages$: Observable<any>;
    constructor(
        public store: Store<fromOrganisationPendingStore.OrganisationState>
    ) { }

    ngOnInit() {
        // // TODO: should get reviewedOrganisations
        // this.$reviewedOrganisationsSubscription = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs))
        //     .subscribe((response: any) => { // TODO: should have correct type
        //         if (response.reviewedOrganisations.length > 0) {
        //             this.reviewedOrganisations = response.reviewedOrganisations;
        //         } else {
        //             this.onGoBack();
        //         }
        //     });
        // // Organisation error
        // this.serverResponseMessages$ = this.store.pipe( select(fromOrganisationPendingStore.errorOrganisations));
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

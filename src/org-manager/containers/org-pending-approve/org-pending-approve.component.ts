import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './org-pending-approve.component.html'
})
export class OrgPendingApproveComponent implements OnInit, OnDestroy {
    public reviewedOrganisations: OrganisationVM[];
    public $reviewedOrganisationsSubscription: Subscription;
    public serverResponseMessages$: Observable<any>;
    constructor(
        public store: Store<fromOrganisationPendingStore.OrganisationState>
    ) { }

    public ngOnInit() {
        // TODO: should get reviewedOrganisations
        this.$reviewedOrganisationsSubscription = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs))
            .subscribe((response: any) => { // TODO: should have correct type
                if (response.reviewedOrganisations.length > 0) {
                    this.reviewedOrganisations = response.reviewedOrganisations;
                } else {
                    this.onGoBack();
                }
            });
        // Organisation error
        this.serverResponseMessages$ = this.store.pipe( select(fromOrganisationPendingStore.errorOganisations));
    }


    public onGoBack() {
        this.store.dispatch(new fromRoot.Back());
    }

    public onApproveOrganisations() {
        this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(this.reviewedOrganisations));
    }

    public ngOnDestroy() {
        this.$reviewedOrganisationsSubscription.unsubscribe();
    }
}

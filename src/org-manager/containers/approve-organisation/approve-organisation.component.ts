import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store/'
import { Store, select } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import {take} from 'rxjs/operators';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './approve-organisation.component.html'
})
export class ApproveOrganisationComponent implements OnInit, OnDestroy {
    orgForReview: OrganisationVM | null;
    serverResponseMessages$: Observable<any>;
    constructor(
        public store: Store<fromOrganisationPendingStore.OrganisationRootState>
    ) { }

    ngOnInit() {
        this.store.pipe(select(fromStore.getOrganisationForReview), take(1))
            .subscribe((org: OrganisationVM) => {
               if (!org) {
                 this.store.dispatch(new fromRoot.Go({path: ['/pending-organisations']}));
               }
               this.orgForReview = org;
            });

        // Organisation error
        // this.serverResponseMessages$ = this.store.pipe( select(fromStore.errorOrganisations));
    }


    onGoBack() {
        this.store.dispatch(new fromRoot.Back());
    }

    onApproveOrganisations() {
        this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(this.orgForReview));
    }

    ngOnDestroy() {
        // this.$reviewedOrganisationsSubscription.unsubscribe();
    }
}

import { Component, OnInit } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './org-pending-approve.component.html'
})
export class OrgPendingApproveComponent implements OnInit {

    reviewedOrgs$: any;
    reviewedOrganisations$: Observable<PendingOrganisation>;

    constructor(private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) { }

    ngOnInit() {
        this.reviewedOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.reviewedOrganisations));
        this.reviewedOrgs$.subscribe(data => this.reviewedOrganisations$ = data.reviewedOrganisations);
        this.store.subscribe((state) => {
            console.log(this.reviewedOrganisations$);
        });

    }


    onGoBack() {
        this.store.dispatch(new fromRoot.Back());
    }
}

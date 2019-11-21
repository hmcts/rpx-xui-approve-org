import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store/'
import { Store, select } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import {take, tap} from 'rxjs/operators';

@Component({
    selector: 'app-org-pending-approve',
    templateUrl: './approve-organisation.component.html'
})
export class ApproveOrganisationComponent implements OnInit {
    orgForReview: OrganisationVM | null;
    serverResponseMessages$: Observable<any>;
    disabled = true;
    constructor(
        public store: Store<fromOrganisationPendingStore.OrganisationRootState>
    ) { }

    ngOnInit() {
      this.store.pipe(select(fromStore.getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {
        if (!org) {
          this.store.dispatch(new fromRoot.Go({path: ['/pending-organisations']}));
        }
        this.orgForReview = org;
      });
      this.serverResponseMessages$ = this.store.pipe(select(fromStore.getErrorMessage), tap(message => {
        if (message) {
          this.disabled = true;
        }
      }));
    }

    onApproveOrganisations() {
        this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(this.orgForReview));
        this.disabled = false;
    }

}

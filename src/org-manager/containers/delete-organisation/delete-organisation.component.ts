import { Component, OnInit, OnDestroy } from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store/';
import { Store, select } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import {take, tap} from 'rxjs/operators';
import { DeletePendingOrganisation } from '../../store/actions/organisations.actions';

@Component({
    selector: 'app-org-pending-delete',
    templateUrl: './delete-organisation.component.html'
})
export class DeleteOrganisationComponent implements OnInit {
    orgForReview: OrganisationVM | null;
    // serverResponseMessages$: Observable<any>;
    public confirmButtonDisabled = false;

    constructor(
        public store: Store<fromOrganisationPendingStore.OrganisationRootState>
    ) { }

    // TODO: Error message
    public ngOnInit() {
      console.log('on init within delete organisation component');
      this.store.pipe(select(fromStore.getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {
        if (!org) {
          this.store.dispatch(new fromRoot.Go({path: ['/pending-organisations']}));
        }
        this.orgForReview = org;
      });
      // this.serverResponseMessages$ = this.store.pipe(select(fromStore.getErrorMessage), tap(message => {
      //   if (message) {
      //     this.disabled = true;
      //   }
      // }));
    }

    public onDeleteOrganisation(orgForReview) {
        console.log('orgForReview');
        console.log(orgForReview);
        this.store.dispatch(new fromOrganisationPendingStore.DeletePendingOrganisation(orgForReview));
        // this.disabled = false;
    }

}

import {Component} from '@angular/core';
import { Router } from '@angular/router';
import {Store} from '@ngrx/store';
import {Go} from '../../../app/store/actions';
import {OrganisationVM} from '../../../org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-org-pending-review',
  templateUrl: './review-organisation.component.html'
})
export class ReviewOrganisationComponent {
  public orgForReview: OrganisationVM;
  public confirmButtonDisabled = false;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>, private readonly router: Router) {
    const org = this.router.getCurrentNavigation();
    if (!org || !org.extras || !org.extras.state) {
      this.store.dispatch(new Go({ path: ['/pending-organisations'] }));
    }

    if (org && org.extras && org.extras.state.data) {
      this.orgForReview = org.extras.state.data as OrganisationVM;
    }
  }

  public onPutReviewOrganisation() {
    this.store.dispatch(new fromOrganisationPendingStore.PutReviewOrganisation(this.orgForReview));
  }
}

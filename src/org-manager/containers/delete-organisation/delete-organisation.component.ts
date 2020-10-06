import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {take, tap} from 'rxjs/operators';
import {Go} from '../../../app/store/actions';
import {OrganisationVM} from '../../../org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {DeleteOrganisation, DeletePendingOrganisation} from '../../store/actions/organisations.actions';
import {getOrganisationForReview} from '../../store/selectors';

@Component({
  selector: 'app-org-pending-delete',
  templateUrl: './delete-organisation.component.html'
})
export class DeleteOrganisationComponent implements OnInit {

  public orgForReview: OrganisationVM | null;

  public confirmButtonDisabled = false;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>) {
  }

  public ngOnInit() {

    this.addOrganisationForReviewSubscribe();
  }

  /**
   * Add Organisation For Review Subscribe
   *
   * We subscribe to the organisation under review, so that we can display this information to the user within the view.
   */
  public addOrganisationForReviewSubscribe() {

    this.store.pipe(select(getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {
      if (!org) {
        this.store.dispatch(new Go({path: ['/pending-organisations']}));
      }
      this.orgForReview = org;
    });
  }

  /**
   * On Delete Organisation Handler
   *
   * @param orgForReview
   */
  public onDeleteOrganisationHandler(orgForReview: OrganisationVM) {
    if (orgForReview.status === 'PENDING') {
      this.store.dispatch(new DeletePendingOrganisation(orgForReview));
    } else {
      this.store.dispatch(new DeleteOrganisation(orgForReview));
    }
    // TODO: What should happen if the organisation status is neither "PENDING" nor "ACTIVE"? Is that even possible?
  }
}

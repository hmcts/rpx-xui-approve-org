import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {take, tap} from 'rxjs/operators';
import {Go} from '../../../app/store/actions';
import {OrganisationVM} from '../../../org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {getOrganisationForReview} from '../../store/selectors';

@Component({
  selector: 'app-org-pending-review',
  templateUrl: './review-organisation.component.html'
})
export class ReviewOrganisationComponent implements OnInit {
  public orgForReview: OrganisationVM | null;
  public confirmButtonDisabled = false;

  constructor(private readonly store: Store<fromOrganisationPendingStore.OrganisationRootState>) {
  }

  public ngOnInit(): void {
    this.addOrganisationForReviewSubscribe();
  }

  /**
   * Add Organisation For Review Subscribe
   *
   * We subscribe to the organisation under review, so that we can display this information to the user within the view.
   */
  public addOrganisationForReviewSubscribe(): void {
    this.store.pipe(select(getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {
      if (!org) {
        this.store.dispatch(new Go({path: ['/pending-organisations']}));
      }
      this.orgForReview = org;
    });
  }
}

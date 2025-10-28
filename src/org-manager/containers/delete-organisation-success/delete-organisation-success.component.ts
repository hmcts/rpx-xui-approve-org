import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { OrganisationVM } from '../../models/organisation';
import * as fromOrganisationPendingStore from '../../store';
import { getOrganisationForReview } from '../../store/selectors';

@Component({
  selector: 'app-delete-success',
  templateUrl: './delete-organisation-success.component.html',
  standalone: false
})
export class DeleteOrganisationSuccessComponent implements OnInit {
  public orgForReview: OrganisationVM | null;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>) {}

  public ngOnInit() {
    this.addOrganisationForReviewSubscribe();
  }

  public addOrganisationForReviewSubscribe() {
    this.store.pipe(select(getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {
      this.orgForReview = org;
    });
  }
}

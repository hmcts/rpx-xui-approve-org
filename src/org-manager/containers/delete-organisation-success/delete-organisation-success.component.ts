import {Component, OnInit} from '@angular/core';
import {OrganisationVM} from '../../models/organisation';
import {getOrganisationForReview} from '../../store/selectors';
import {select, Store} from '@ngrx/store';
import {take} from 'rxjs/operators';
import * as fromOrganisationPendingStore from '../../store';

@Component({
    selector: 'app-delete-success',
    templateUrl: './delete-organisation-success.component.html'
})
export class DeleteOrganisationSuccessComponent  implements OnInit {

  public orgForReview: OrganisationVM | null;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>) {
  }

  public ngOnInit() {

    this.addOrganisationForReviewSubscribe();
  }

  public addOrganisationForReviewSubscribe() {

    this.store.pipe(select(getOrganisationForReview), take(1)).subscribe((org: OrganisationVM) => {

      this.orgForReview = org;
    });
  }
}

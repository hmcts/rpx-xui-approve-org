import {Component, OnInit, OnDestroy} from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {Store, select} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {OrganisationVM} from 'src/org-manager/models/organisation';
import {take, tap} from 'rxjs/operators';
import {DeletePendingOrganisation} from '../../store/actions/organisations.actions';
import {Go} from '../../../app/store/actions';
import {getOrganisationForReview} from '../../store/selectors';

@Component({
  selector: 'app-org-pending-delete',
  templateUrl: './delete-organisation.component.html'
})
export class DeleteOrganisationComponent implements OnInit {

  public orgForReview: OrganisationVM | null;

  // TODO: Error message hook. Leave this in for Error messages.
  // serverResponseMessages$: Observable<any>;

  public confirmButtonDisabled = false;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>) {
  }

  public ngOnInit() {

    this.addOrganisationForReviewSubscribe();
    this.addErrorMessageSelect();
  }

  /**
   * Add Error Message Select
   *
   * TODO: Error message hook. Leave this in for when Error Message development
   * is being worked on.
   */
  public addErrorMessageSelect() {

    // this.serverResponseMessages$ = this.store.pipe(select(fromStore.getErrorMessage), tap(message => {
    //   if (message) {
    //     this.disabled = true;
    //   }
    // }));
  }

  /**
   * Add Organisation For Review Subscribe
   *
   * We subscribe to the organisation under review, so that we can display this information to the user within the view.
   *
   * TODO: Not exactly sure why it's called organisation for review. I guess it's the organisation that the User
   * is currently reviewing.
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
  public onDeleteOrganisationHandler(orgForReview) {

    this.store.dispatch(new DeletePendingOrganisation(orgForReview));
    // this.disabled = false;
  }
}

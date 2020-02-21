import {Component, OnInit} from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html'
})
export class OrganisationDetailsComponent implements OnInit {

  public orgs$: Observable<OrganisationVM>;
  public userLists$: Observable<User[]>;
  public showUsers = false;
  public showUserDetails = false;
  public userDetails: User = null;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.store.dispatch(new fromStore.ResetOrganisationUsers());
    this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromStore.LoadActiveOrganisation());
        this.store.dispatch(new fromStore.LoadPendingOrganisations());
      }
    });

    this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
    this.orgs$.pipe(
        filter(value => value !== undefined),
        take(1)
    ).subscribe(({organisationId, pbaNumber, isAccLoaded, status}) => {
      if (status === 'ACTIVE') {
        this.store.dispatch(new fromStore.LoadOrganisationUsers(organisationId));
      }
      if (!isAccLoaded && pbaNumber.length) {
        this.store.dispatch(new fromStore.LoadPbaAccountsDetails({
              orgId: organisationId,
              pbas: pbaNumber.toString()
            }
          )
        );
      }
    });
    this.userLists$ = this.store.pipe(select(fromStore.getOrganisationUsersList));
  }

  public onGoBack() {
    if (this.showUserDetails) {
      this.showUserDetails = false;
      this.userDetails = null;
    } else {
      this.store.dispatch(new fromRoot.Back());
    }
  }

  public approveOrganisation(data: OrganisationVM) {
    if (data) {
      this.store.dispatch(new fromStore.AddReviewOrganisations(data));
    }
  }

  public showUsersTab(showUsers: boolean) {
    this.showUsers = showUsers;
  }

  public onShowUserDetails(user: User) {
    if (user) {
      this.showUserDetails = true;
      this.userDetails = user;
    }
  }

}


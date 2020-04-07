import {Component, OnInit} from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import { AppConstants } from 'src/app/app.constants';
import { environment } from 'src/environments/environment';
import { OrganisationUserListModel, OrganisationVM} from 'src/org-manager/models/organisation';
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
  public userLists$: Observable<OrganisationUserListModel>;
  public showUsers = false;
  // public showUserDetails = false;
  // public userDetails: User = null;
  public isXuiApproverUserdata = false;
  public showUserNavigation = false;
  public organisationId: string;
  public organisationAdminEmail: string;
  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly cookieService: CookieService) {}

  public ngOnInit(): void {

    const userRoles = this.cookieService.get(environment.cookies.roles);
    console.log(userRoles);
    if (userRoles && userRoles.indexOf(AppConstants.XUI_APPROVAL_ROLE) !== -1) {
      this.isXuiApproverUserdata = true;
    }

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
    ).subscribe(({organisationId, pbaNumber, isAccLoaded, status, adminEmail}) => {
      this.organisationId = organisationId;
      this.organisationAdminEmail = adminEmail;
      if (status === 'ACTIVE' && this.isXuiApproverUserdata) {
        this.showUserNavigation = true;
        this.store.dispatch(new fromStore.LoadOrganisationUsers(organisationId));
      } else {
        this.showUserNavigation = false;
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
    this.store.dispatch(new fromRoot.Back());
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
      this.store.dispatch(new fromStore.ShowUserDetails({userDetails: user, isSuperUser: this.organisationAdminEmail === user.email, orgId: this.organisationId}));
    }
  }
}


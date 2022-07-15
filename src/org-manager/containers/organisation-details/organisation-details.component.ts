import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@hmcts/rpx-xui-common-lib';
import { OrganisationService, UsersService } from 'src/org-manager/services';
import { AppUtils } from '../../../app/utils/app-utils';
import { UserApprovalGuard } from '../../guards/users-approval.guard';
import { OrganisationUserListModel, OrganisationVM } from '../../models/organisation';
import { PbaAccountDetails } from '../../services/pba-account-details.services';
import * as fromStore from '../../store';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html'
})
export class OrganisationDetailsComponent implements OnInit, OnDestroy {

  public orgs$: Observable<OrganisationVM>;
  public userLists$: Observable<OrganisationUserListModel>;
  public showUsers = false;
  public isXuiApproverUserdata = false;
  public showUserNavigation = false;
  public organisationId: string;
  public organisationAdminEmail: string;
  public isActiveOrg = false;
  public organisationDeletable = false;

  private getShowOrgDetailsSubscription: Subscription;
  private readonly getAllLoadedSubscription: Subscription;
  private getOrganisationDeletableSubscription: Subscription;
  public orgId: string;

  public currentPageNumber: number = 1;
  public pageTotalSize: number;
  

  constructor(
    private readonly router: Router,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly userApprovalGuard: UserApprovalGuard,
    private readonly userSerive: UsersService,
    private readonly organisationService: OrganisationService,
    private readonly route: ActivatedRoute,
    public readonly pbaAccountDetails: PbaAccountDetails) {
    this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }


  public ngOnInit(): void {
    this.isXuiApproverUserdata = this.userApprovalGuard.isUserApprovalRole();
    if (this.isXuiApproverUserdata) {
      this.getShowOrgDetailsSubscription = this.store.pipe(select(fromStore.getShowOrgDetailsUserTabSelector)).subscribe(value => this.showUsers = value);
    }

    this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(take(1), map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(organisationVM => {
        this.organisationId = organisationVM.organisationId;
        this.organisationAdminEmail = organisationVM.adminEmail;
        this.showUserNavigation = organisationVM.status === 'ACTIVE' ? true : false;
    });

    this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
    this.orgs$.pipe(
      filter(value => value !== undefined),
      take(1)
    ).subscribe(({organisationId, pbaNumber, isAccLoaded, status, adminEmail}) => {
      this.organisationId = organisationId;
      this.organisationAdminEmail = adminEmail;
      this.showUserNavigation = false;
      if (status === 'ACTIVE') {
        this.isActiveOrg = true;
        // Check the deletable status of the organisation (required to control visibility of the "Delete" button)
        this.store.dispatch(new fromStore.GetOrganisationDeletableStatus(this.organisationId));
        this.getOrganisationDeletableSubscription = this.store.pipe(select(fromStore.getOrganisationDeletable)).subscribe(value => this.organisationDeletable = value);
        if (this.isXuiApproverUserdata) {
          this.showUserNavigation = true;
          this.store.dispatch(new fromStore.LoadOrganisationUsers({orgId: this.organisationId, pageNo: this.currentPageNumber - 1}));
        }
      }

      if (!isAccLoaded && pbaNumber.length) {
        this.store.dispatch(new fromStore.LoadPbaAccountsDetails({
              orgId: organisationId,
              pbas: pbaNumber.toString()
            }
          )
        );
      }

      if (this.organisationId) {
        this.getAllUsers(this.organisationId);
      }
    });
    this.userLists$ = this.store.pipe(select(fromStore.getOrganisationUsersList));
  }

  private getAllUsers(orgId: string) {
    return this.userSerive.getAllUsersList(orgId).subscribe((userList => {
      this.pageTotalSize = userList.users.length;
    }));
  }

  public pageChange(pageNumber: number) {
    this.currentPageNumber = pageNumber;
    this.store.dispatch(new fromStore.LoadOrganisationUsers({orgId: this.organisationId, pageNo: this.currentPageNumber - 1}));
    this.userLists$ = this.store.pipe(select(fromStore.getOrganisationUsersList));
  }

  public onGoBack() {
    this.router.navigateByUrl(this.isActiveOrg ? '/active-organisation' : '/pending-organisations');
  }

  public approveOrganisation(data: OrganisationVM) {
    if (data) {
      const navigationExtras = {
        state: {
          data
        }
      };
      this.router.navigateByUrl('/approve-organisations', navigationExtras);
    }
  }

  public deleteOrganisation(data: OrganisationVM) {
    if (data) {
      const navigationExtras = {
        state: {
          data
        }
      };
      this.router.navigateByUrl('/delete-organisation', navigationExtras);
    }
  }

  public reviewOrganisation(data: OrganisationVM): void {
    if (data) {
      const navigationExtras = {
        state: {
          data
        }
      };
      this.router.navigateByUrl('/review-organisation', navigationExtras);
    }
  }

  public showUsersTab(showUsers: boolean) {
    this.showUsers = showUsers;
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: showUsers }));
  }

  public onShowUserDetails(user: User) {
    if (user) {
      this.store.dispatch(new fromStore.ShowUserDetails({ userDetails: user, isSuperUser: this.organisationAdminEmail === user.email, orgId: this.organisationId }));
    }
  }

  public ngOnDestroy() {
    if (this.getAllLoadedSubscription) {
      this.getAllLoadedSubscription.unsubscribe();
    }
    if (this.getShowOrgDetailsSubscription) {
      this.getShowOrgDetailsSubscription.unsubscribe();
    }
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: false }));

    if (this.getOrganisationDeletableSubscription) {
      this.getOrganisationDeletableSubscription.unsubscribe();
    }

    // Update the "organisation deletable" status in the store manually to false (to avoid the "Delete" button being
    // displayed when it shouldn't)
    this.store.dispatch(new fromStore.GetOrganisationDeletableStatusSuccess(false));
  }
}

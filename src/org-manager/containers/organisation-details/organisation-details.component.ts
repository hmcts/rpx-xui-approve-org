import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { filter, map, take, takeWhile } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import { UserApprovalGuard } from '../../guards/users-approval.guard';
import { OrganisationUserListModel, OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services/organisation.service';
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
  private getAllLoadedSubscription: Subscription;
  private getOrganisationDeletableSubscription: Subscription;
  public orgId: string;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly userApprovalGuard: UserApprovalGuard,
    private readonly organisationService: OrganisationService,
    private readonly route: ActivatedRoute,
    public readonly pbaAccountDetails: PbaAccountDetails,
  ) {
    this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }

  public ngOnInit(): void {

    this.isXuiApproverUserdata = this.userApprovalGuard.isUserApprovalRole();
    if (this.isXuiApproverUserdata) {
      this.getShowOrgDetailsSubscription = this.store.pipe(select(fromStore.getShowOrgDetailsUserTabSelector)).subscribe(value => this.showUsers = value);
    }

    this.store.dispatch(new fromStore.ResetOrganisationUsers());
    this.getAllLoadedSubscription = this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromStore.LoadActiveOrganisation());
        this.store.dispatch(new fromStore.LoadPendingOrganisations());
      }
    });

    this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(organisationVM => {
        this.organisationId = organisationVM.organisationId;
        this.organisationAdminEmail = organisationVM.adminEmail;
        this.showUserNavigation = false;

        if (organisationVM.status === 'ACTIVE') {
          this.isActiveOrg = true;
          this.organisationService.getOrganisationDeletableStatus(this.organisationId).subscribe(value => this.organisationDeletable = value);
        }

        if (organisationVM.pbaNumber && organisationVM.pbaNumber.length) {
          let ids: string;
          organisationVM.pbaNumber.forEach(pbaNumber => {
            ids = !ids ? pbaNumber : `${ids},${pbaNumber}`;
          });
          this.pbaAccountDetails.getAccountDetails(ids).subscribe(accountResponse => {
            organisationVM.accountDetails = accountResponse;
          });
        }

        if (organisationVM.organisationId) {
          try {
            this.userLists$ = this.organisationService.getOrganisationUsers(organisationVM.organisationId).pipe(
              map(data => {
                const orgUserListModel = {
                  users: AppUtils.mapUsers(data.users),
                  isError: false,
                } as OrganisationUserListModel;
                return orgUserListModel;
              }));
          } catch (error) {
          }
        }

        this.orgs$ = of(organisationVM);
      });

    this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
    this.orgs$.pipe(
      filter(value => value !== undefined),
      take(1)
    ).subscribe(({ organisationId, pbaNumber, isAccLoaded, status, adminEmail }) => {
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
          this.store.dispatch(new fromStore.LoadOrganisationUsers(organisationId));
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
    });
    this.userLists$ = this.store.pipe(select(fromStore.getOrganisationUsersList));
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Go({ path: [this.isActiveOrg ? '/active-organisation' : '/pending-organisations'] }));
  }

  public approveOrganisation(data: OrganisationVM) {
    if (data) {
      this.store.dispatch(new fromStore.AddReviewOrganisations(data));
    }
  }

  public deleteOrganisation(data: OrganisationVM) {
    if (data) {
      this.store.dispatch(new fromStore.NavigateToDeleteOrganisation(data));
    }
  }

  public reviewOrganisation(data: OrganisationVM): void {
    if (data) {
      this.store.dispatch(new fromStore.NavigateToReviewOrganisation(data));
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

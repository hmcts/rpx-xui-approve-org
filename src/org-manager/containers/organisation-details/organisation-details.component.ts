import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtils } from 'src/app/utils/app-utils';
import { OrganisationService, PbaAccountDetails } from 'src/org-manager/services';
import * as fromRoot from '../../../app/store';
import { UserApprovalGuard } from '../../guards/users-approval.guard';
import { OrganisationUserListModel, OrganisationVM } from '../../models/organisation';
import * as fromStore from '../../store';

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
  private readonly getAllLoadedSubscription: Subscription;
  private readonly getOrganisationDeletableSubscription: Subscription;
  private orgId: string;
  public getShowOrgDetailsSubscription: Subscription;

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
          this.userLists$ = this.organisationService.getOrganisationUsers(organisationVM.organisationId).pipe(
            map(data => {
              const orgUserListModel = {
                users: AppUtils.mapUsers(data.users),
                isError: false,
              } as OrganisationUserListModel;
              return orgUserListModel;
            }));
        }

        this.orgs$ = of(organisationVM);
      });
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
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: false }));

    if (this.getOrganisationDeletableSubscription) {
      this.getOrganisationDeletableSubscription.unsubscribe();
    }

    if (this.getShowOrgDetailsSubscription) {
      this.getShowOrgDetailsSubscription.unsubscribe();
    }

    this.store.dispatch(new fromStore.GetOrganisationDeletableStatusSuccess(false));
  }
}

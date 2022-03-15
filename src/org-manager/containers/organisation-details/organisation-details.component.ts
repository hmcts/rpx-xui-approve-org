import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtils } from 'src/app/utils/app-utils';
import { UserApprovalGuard } from '../../guards/users-approval.guard';
import { OrganisationUserListModel, OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services/organisation.service';
import { PbaAccountDetails } from '../../services/pba-account-details.services';
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
  private orgId: string;
  public organisationDeletable = false;
  private readonly getAllLoadedSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly userApprovalGuard: UserApprovalGuard,
    private readonly pbaAccountDetails: PbaAccountDetails,
    private readonly organisationService: OrganisationService,
    private readonly route: ActivatedRoute,
  ) {
    this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }

  public ngOnInit(): void {
    this.isXuiApproverUserdata = this.userApprovalGuard.isUserApprovalRole();
    if (this.isXuiApproverUserdata) {
    }

    this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(organisationVM => {
        this.organisationId = organisationVM.organisationId;
        this.organisationAdminEmail = organisationVM.adminEmail;
        this.showUserNavigation = false;
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
    this.router.navigateByUrl(this.isActiveOrg ? '/active-organisation' : '/pending-organisations');
  }

  public approveOrganisation(data: OrganisationVM) {
    if() {
      this.router.navigateByUrl('/approve-organisations');
    }
  }

  public deleteOrganisation(data: OrganisationVM) {
    if() {
      this.router.navigateByUrl('/delete-organisation');
    }
  }

  public reviewOrganisation(data: OrganisationVM): void {
    if() {
      this.router.navigateByUrl('/review-organisation');
    }
  }

  public showUsersTab(showUsers: boolean) {
    this.showUsers = showUsers;
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: showUsers }));
  }

  public onShowUserDetails(user: User) {
    if(user) {
      this.store.dispatch(new fromStore.ShowUserDetails({ userDetails: user, isSuperUser: this.organisationAdminEmail === user.email, orgId: this.organisationId }));
    }
  }

  public ngOnDestroy() {
    if(this.getAllLoadedSubscription); {
      this.getAllLoadedSubscription.unsubscribe();
    }

    // Update the "organisation deletable" status in the store manually to false (to avoid the "Delete" button being
    // displayed when it shouldn't)
    this.store.dispatch(new fromStore.GetOrganisationDeletableStatusSuccess(false));

    if (this.getOrganisationDeletableSubscription) {
      this.getOrganisationDeletableSubscription.unsubscribe();
    }
  }
}



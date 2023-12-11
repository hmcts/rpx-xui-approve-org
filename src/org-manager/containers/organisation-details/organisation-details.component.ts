import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FeatureToggleService, User } from '@hmcts/rpx-xui-common-lib';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AppConstants } from '../../../app/app.constants';
import { AppUtils } from '../../../app/utils/app-utils';
import { UsersService } from '../../../org-manager/services';
import { LovRefDataModel } from '../../../shared/models/lovRefData.model';
import { LovRefDataService } from '../../../shared/services/lov-ref-data.service';
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
  public readonly CATEGORY_ORGANISATION_TYPE = 'OrgType';
  public orgs$: Observable<OrganisationVM>;
  public userLists$: Observable<OrganisationUserListModel>;
  public showUsers = false;
  public isXuiApproverUserdata = false;
  public showUserNavigation = false;
  public organisationId: string;
  public organisationAdminEmail: string;
  public isActiveOrg = false;
  public organisationDeletable = false;
  public currentPageNumber: number = 1;
  public pageTotalSize: number;
  public newRegisterOrg = false;
  public organisationTypes: LovRefDataModel[];
  private getShowOrgDetailsSubscription: Subscription;
  private readonly getAllLoadedSubscription: Subscription;
  private readonly getOrganisationDeletableSubscription: Subscription;
  public orgTypeSubscription: Subscription;
  public orgId: string;

  constructor(
    private readonly router: Router,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly userApprovalGuard: UserApprovalGuard,
    private readonly route: ActivatedRoute,
    public readonly pbaAccountDetails: PbaAccountDetails,
    private readonly userService: UsersService,
    private readonly organisationService: OrganisationService,
    private readonly lovRefDataService: LovRefDataService,
    private readonly featureToggleService: FeatureToggleService) {
    this.route.params.subscribe((params) => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }

  public ngOnInit(): void {
    this.isXuiApproverUserdata = this.userApprovalGuard.isUserApprovalRole();
    if (this.isXuiApproverUserdata) {
      this.getShowOrgDetailsSubscription = this.store.pipe(select(fromStore.getShowOrgDetailsUserTabSelector)).subscribe((value) => this.showUsers = value);
    }
    this.featureToggleService.getValue(AppConstants.FEATURE_NAMES.newRegisterOrg, false).subscribe((newRegisterOrgFeature) => {
      this.newRegisterOrg = newRegisterOrgFeature;
      this.organisationService.getSingleOrganisation({ id: this.orgId, version: newRegisterOrgFeature ? 'v2' : 'v1' })
        .pipe(take(1), map((apiOrg) => AppUtils.mapOrganisation(apiOrg)))
        .subscribe((organisationVM) => {
          this.organisationId = organisationVM.organisationId;
          this.organisationAdminEmail = organisationVM.adminEmail;
          this.showUserNavigation = organisationVM.status === 'ACTIVE' ? true : false;

          if (organisationVM.status === 'ACTIVE') {
            this.isActiveOrg = true;
            if (this.isXuiApproverUserdata) {
              this.showUserNavigation = true;
              this.store.dispatch(new fromStore.LoadOrganisationUsers({ orgId: this.organisationId, pageNo: this.currentPageNumber - 1 }));
            }
            this.organisationService.getOrganisationDeletableStatus(this.organisationId).subscribe((value) => this.organisationDeletable = value);
          }

          let ids: string;

          if (organisationVM.pendingPaymentAccount && organisationVM.pendingPaymentAccount.length) {
            organisationVM.pendingPaymentAccount.forEach((pbaNumber) => {
              ids = !ids ? pbaNumber : `${ids},${pbaNumber}`;
            });
            this.pbaAccountDetails.getAccountDetails(ids).pipe(take(1)).subscribe((accountResponse) => {
              organisationVM.accountDetails = accountResponse;
            });
          } else if (organisationVM.pbaNumber && organisationVM.pbaNumber.length) {
            organisationVM.pbaNumber.forEach((pbaNumber) => {
              ids = !ids ? pbaNumber : `${ids},${pbaNumber}`;
            });
            this.pbaAccountDetails.getAccountDetails(ids).pipe(take(1)).subscribe((accountResponse) => {
              organisationVM.accountDetails = accountResponse;
            });
          }

          if (organisationVM.status === 'ACTIVE' && organisationVM.organisationId) {
            try {
              this.getAllUsers(organisationVM.organisationId);
              this.userLists$ = this.organisationService.getOrganisationUsers(organisationVM.organisationId, this.currentPageNumber - 1).pipe(
                map((data) => {
                  const orgUserListModel = {
                    users: AppUtils.mapUsers(data.users),
                    isError: false
                  } as OrganisationUserListModel;
                  return orgUserListModel;
                }));
              // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          this.orgs$ = of(organisationVM);
        });
      if (this.newRegisterOrg) {
        this.orgTypeSubscription = this.lovRefDataService.getListOfValues(this.CATEGORY_ORGANISATION_TYPE, true).subscribe((orgTypes) => {
          this.organisationTypes = orgTypes;
        });
      }
    });
  }

  private getAllUsers(orgId: string) {
    return this.userService.getAllUsersList(orgId).subscribe(((userList) => {
      this.pageTotalSize = userList.users.length;
    }));
  }

  public pageChange(pageNumber: number) {
    this.currentPageNumber = pageNumber;
    this.store.dispatch(new fromStore.LoadOrganisationUsers({ orgId: this.organisationId, pageNo: this.currentPageNumber - 1 }));
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

    if (this.orgTypeSubscription) {
      this.orgTypeSubscription.unsubscribe();
    }

    // Update the "organisation deletable" status in the store manually to false (to avoid the "Delete" button being
    // displayed when it shouldn't)
    this.store.dispatch(new fromStore.GetOrganisationDeletableStatusSuccess(false));
  }
}

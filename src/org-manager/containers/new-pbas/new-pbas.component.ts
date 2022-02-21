import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtils } from 'src/app/utils/app-utils';
import { PbaAccountDetails } from 'src/org-manager/services/pba-account-details.services';
import * as fromRoot from '../../../app/store';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services/organisation.service';
import * as fromStore from '../../store';

@Component({
  selector: 'app-new-pbas',
  templateUrl: './new-pbas.component.html'
})
export class NewPBAsComponent implements OnInit, OnDestroy {

  public confirmDecision: boolean = false;
  public newPBAs = new Map<string, string>();
  public orgs$: Observable<OrganisationVM>;
  public organisationId: string;
  public orgId: string;
  public orgSubscription: Subscription;
  public routeSubscription: Subscription;
  public pbaSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly organisationService: OrganisationService,
    private readonly route: ActivatedRoute,
    private readonly pbaAccountDetails: PbaAccountDetails,
  ) {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }

  public ngOnInit(): void {
    this.orgSubscription = this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(organisationVM => {
        this.organisationId = organisationVM.organisationId;
        this.orgs$ = of(organisationVM);
        if (organisationVM.pbaNumber && organisationVM.pbaNumber.length) {
          let ids: string;
          organisationVM.pbaNumber.forEach(pbaNumber => {
            ids = !ids ? pbaNumber : `${ids},${pbaNumber}`;
          });
          this.pbaSubscription = this.pbaAccountDetails.getAccountDetails(ids).subscribe(accountResponse => {
            organisationVM.accountDetails = accountResponse;
          });
        }
      });
  }

  public onGoBack(): void {
    if (!this.confirmDecision) {
      this.store.dispatch(new fromRoot.Go({ path: ['/organisation/pbas'] }));
    } else {
      this.confirmDecision = false;
    }
  }

  public onContinue(): void {
    this.confirmDecision = true;
  }

  public setNewPBA(event): void {
    if (this.newPBAs[event.name]) {
      this.newPBAs[event.name] = event.value;
    } else {
      this.newPBAs.set(event.name, event.value);
    }
  }

  public ngOnDestroy(): void {
    if (this.orgSubscription) {
      this.orgSubscription.unsubscribe();
    }

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.pbaSubscription) {
      this.pbaSubscription.unsubscribe();
    }

    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: false }));
  }
}

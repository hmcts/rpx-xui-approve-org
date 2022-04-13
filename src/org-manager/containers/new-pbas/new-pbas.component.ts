import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services/organisation.service';
import { PbaAccountDetails } from '../../services/pba-account-details.services';
import * as fromStore from '../../store';

@Component({
  selector: 'app-new-pbas',
  templateUrl: './new-pbas.component.html'
})
export class NewPBAsComponent implements OnInit, OnDestroy {

  public confirmDecision: boolean = false;
  private getAllLoadedSubscription: Subscription;
  public newPBAs = new Map<string, string>();
  public orgs$: Observable<OrganisationVM>;
  public organisationId: string;

  constructor(
    private readonly organisationService: OrganisationService,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly route: ActivatedRoute,
    public readonly pbaAccountDetails: PbaAccountDetails,
  ) {
    this.route.params.subscribe(params => {
      this.organisationId = params.orgId ? params.orgId : '';
    });
   }

  public ngOnInit(): void {
    this.getAllLoadedSubscription = this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromStore.LoadActiveOrganisation());
        this.store.dispatch(new fromStore.LoadPendingOrganisations());
      }
    });

    this.organisationService.getSingleOrganisation({ id: this.organisationId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(value => {
        this.organisationId = value.organisationId;

        if (!value.isAccLoaded && value.pendingPaymentAccount.length) {
        this.store.dispatch(new fromStore.LoadPbaAccountsDetails({
          orgId: value.organisationId,
          pbas: value.pendingPaymentAccount.toString()
        }));

        if (value.pendingPaymentAccount && value.pendingPaymentAccount.length) {
          let ids: string;
          value.pendingPaymentAccount.forEach(pbaNumber => {
            ids = !ids ? pbaNumber : `${ids},${pbaNumber}`;
          });
          this.pbaAccountDetails.getAccountDetails(ids).subscribe(accountResponse => {
            value.accountDetails = accountResponse;
            this.orgs$ = of(value);
          });
        } else {
          this.orgs$ = of(value);
        }
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
    this.newPBAs.set(event.name, event.value);
  }

  public ngOnDestroy(): void {
    if (this.getAllLoadedSubscription) {
      this.getAllLoadedSubscription.unsubscribe();
    }
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: false }));
  }
}

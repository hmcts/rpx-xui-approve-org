import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take, takeWhile } from 'rxjs/operators';

import * as fromRoot from '../../../app/store';
import { OrganisationVM } from '../../models/organisation';
import * as fromStore from '../../store';

@Component({
  selector: 'app-new-pbas',
  templateUrl: './new-pbas.component.html'
})
export class NewPBAsComponent implements OnInit, OnDestroy {

  public orgs$: Observable<OrganisationVM>;
  public organisationId: string;

  private getAllLoadedSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>
  ) { }

  public ngOnInit(): void {
    this.getAllLoadedSubscription = this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromStore.LoadActiveOrganisation());
        this.store.dispatch(new fromStore.LoadPendingOrganisations());
      }
    });

    this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
    this.orgs$.pipe(
      filter(value => value !== undefined),
      take(1)
    ).subscribe(({ organisationId, pbaNumber, isAccLoaded, status }) => {
      this.organisationId = organisationId;

      if (!isAccLoaded && pbaNumber.length) {
        this.store.dispatch(new fromStore.LoadPbaAccountsDetails({
          orgId: organisationId,
          pbas: pbaNumber.toString()
        }));
      }
    });
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Go({ path: ['/organisation/pbas'] }));
  }

  public ngOnDestroy() {
    if (this.getAllLoadedSubscription) {
      this.getAllLoadedSubscription.unsubscribe();
    }
    this.store.dispatch(new fromStore.ShowOrganisationDetailsUserTab({ orgId: this.organisationId, showUserTab: false }));
  }
}

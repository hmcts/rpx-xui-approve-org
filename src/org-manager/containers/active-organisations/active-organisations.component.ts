import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {takeWhile} from 'rxjs/operators';
import * as fromOrganisation from '../../../org-manager/store/';
import {OrganisationVM} from '../../models/organisation';

/**
 * Bootstraps Active Organisations
 */
@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './active-organisations.component.html',
})

export class ActiveOrganisationsComponent implements OnInit {
  public orgs$: Observable<OrganisationVM[]>;
  public loading$: Observable<boolean>;
  public pendingLoaded$: Observable<boolean>;
  public pendingOrgsCount$: Observable<number>;
  public activeSearchString$: Observable<string>;

  constructor(
    private readonly store: Store<fromOrganisation.OrganisationRootState>,
  ) { }

  public ngOnInit(): void {
    this.store.pipe(select(
      fromOrganisation.getActiveLoaded),
      takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
      }
    });

    this.pendingLoaded$ = this.store.pipe(select(fromOrganisation.getPendingLoaded));
    this.pendingLoaded$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });


    this.orgs$ = this.store.pipe(select(fromOrganisation.getActiveOrganisationArray));
    this.loading$ = this.store.pipe(select(fromOrganisation.getActiveLoading));
    this.pendingOrgsCount$ = this.store.pipe(select(fromOrganisation.pendingOrganisationsCount));
    this.activeSearchString$ = this.store.pipe(select(fromOrganisation.getActiveSearchString));

  }

  public submitSearch(searchString: string) {
    this.store.dispatch(new fromOrganisation.UpdateActiveOrganisationsSearchString(searchString));
  }
}

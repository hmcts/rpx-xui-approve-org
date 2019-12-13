import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { Observable } from 'rxjs';
import {takeWhile} from 'rxjs/operators';
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
  public searchString = '';
  public searchFields = {};

  constructor(
    private store: Store<fromOrganisation.OrganisationRootState>,
  ) { }

  ngOnInit(): void {
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

  }

  public submitSearch(search: any) {
    this.searchString = search.searchString;
    this.searchFields = search.searchFields;
  }
}

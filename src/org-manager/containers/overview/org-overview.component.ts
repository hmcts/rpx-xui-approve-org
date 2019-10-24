import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { OrganisationSummary } from '../../models/organisation';
import fromOrganisationStore = fromOrganisationPendingStore;

@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './org-overview.component.html',
})

export class OverviewComponent implements OnInit {
  public orgs$: Observable<OrganisationSummary[]>;
  public loading$: Observable<boolean>;
  public pendingOrgsCount$: Observable<number>;

  constructor(
    private readonly _store: Store<fromOrganisationStore.OrganisationState>,
    private readonly _pendingStore: Store<fromOrganisationPendingStore.OrganisationState>
  ) { }

  public ngOnInit(): void {
    this._store.dispatch(new fromOrganisationStore.LoadOrganisation());
    this.orgs$ = this._store.pipe(select(fromOrganisationStore.organisations));
    this.loading$ = this._store.pipe(select(fromOrganisationStore.organisationsLoading));

    this._pendingStore.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisations());
    this.pendingOrgsCount$ = this._pendingStore.pipe(select(fromOrganisationPendingStore.pendingOrganisationsCount));

  }
}

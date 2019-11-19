import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisationStore from '../../../org-manager/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import { OrganisationSummary } from '../../models/organisation';

@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './org-overview.component.html',
})

export class OverviewComponent implements OnInit {
  orgs$: Observable<Array<OrganisationSummary>>;
  loading$: Observable<boolean>;
  pendingOrgsCount$: Observable<number>;

  constructor(
    private store: Store<fromOrganisationStore.OrganisationState>,
    private pendingStore: Store<fromOrganisationPendingStore.OrganisationState>
  ) { }

  ngOnInit(): void {
    // this.store.dispatch(new fromOrganisationStore.LoadOrganisation());
    // this.orgs$ = this.store.pipe(select(fromOrganisationStore.organisations));
    // this.loading$ = this.store.pipe(select(fromOrganisationStore.organisationsLoading));
    //
    // this.pendingStore.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisations());
    // this.pendingOrgsCount$ = this.pendingStore.pipe(select(fromOrganisationPendingStore.pendingOrganisationsCount));

  }
}

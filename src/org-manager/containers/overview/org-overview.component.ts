import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisationStore from '../../../org-manager/store';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import {Observable} from 'rxjs';
import { OrganisationSummary } from '../../models/organisation';

@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './org-overview.component.html',
})

export class OverviewComponent implements OnInit {
  columnConfig: GovukTableColumnConfig[];
  orgs$: Observable<Array<OrganisationSummary>>;
  loading$: Observable<boolean>;
  pendingOrgsCount$: Observable<number>;

  constructor(private store: Store<fromOrganisationStore.OrganisationState>, private pendingStore: Store<fromOrganisationPendingStore.PendingOrganisationState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationStore.LoadOrganisation());
    this.orgs$ = this.store.pipe(select(fromOrganisationStore.organisations));
    this.loading$ = this.store.pipe(select(fromOrganisationStore.organisationsLoading));
    // TODO tidy up (maybe add to the store or config file)
    this.columnConfig = [
      { header: 'Reference', key: 'organisationId', type: 'multi-column', multiColumnMapping: 'id',
      class: 'govuk-caption-m govuk-!-font-size-16'},
      { header: 'Address', key: 'address' },
      { header: 'Administrator', key: 'admin', type: 'multi-column',
      multiColumnMapping: 'email', class: 'govuk-caption-m govuk-!-font-size-16' },
      { header: 'Status', key: 'status', type: 'styled', class: 'hmcts-badge hmcts-badge--green'},
      { header: null, key: 'view', type: 'link' }
    ];

    this.pendingStore.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisations());
    this.pendingOrgsCount$ = this.pendingStore.pipe(select(fromOrganisationPendingStore.pendingOrganisationsCount));
    
  }
}

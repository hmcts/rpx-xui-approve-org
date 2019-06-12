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
  tableRows: {}[];
  orgs$: Observable<Array<OrganisationSummary>>;
  loading$: Observable<boolean>;
  pendingOrgs$: any;
  pendingOrganisations$: Observable<any>;
  valueTest: String;

  constructor(private store: Store<fromOrganisationStore.OrganisationState>,private pendingStore: Store<fromOrganisationPendingStore.PendingOrganisationState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationStore.LoadOrganisation());
    this.orgs$ = this.store.pipe(select(fromOrganisationStore.organisations));
    console.log('orgs is',this.orgs$)
    this.orgs$.subscribe(val => console.log('val is orgs',val));
    this.loading$ = this.store.pipe(select(fromOrganisationStore.organisationsLoading));
    this.columnConfig = [
      { header: 'Reference', key: 'organisationId', type: 'multi-column', multiColumnMapping: 'id',
      class: 'govuk-caption-m govuk-!-font-size-16'},
      { header: 'Address', key: 'address' },
      { header: 'Administrator', key: 'admin', type: 'multi-column',
      multiColumnMapping: 'email', class: 'govuk-caption-m govuk-!-font-size-16' },
      { header: 'Status', key: 'status', type: 'styled', class: 'hmcts-badge hmcts-badge--green'},
      { header: null, key: 'view', type: 'link' }
    ];

    this.pendingStore.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisationsCount());

    //this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisationsCount));
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations));
    this.pendingOrgs$.subscribe(pendingOrgs$ => this.valueTest = pendingOrgs$.count);
    console.log('count is',this.valueTest)

  }
}

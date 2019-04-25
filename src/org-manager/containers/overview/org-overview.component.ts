import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisationStore from '../../../org-manager/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import {Observable} from 'rxjs';
import { OrganisationSummary } from '../../models/organisation';
@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './org-overview.component.html',
})

export class OverviewComponent implements OnInit{
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  orgs$: Observable<Array<OrganisationSummary>>;
  loading$: Observable<boolean>;

  constructor(private store: Store<fromOrganisationStore.OrganisationState>) {}

  ngOnInit(): void {
    console.log("logging org before");
    this.store.dispatch(new fromOrganisationStore.LoadOrganisation());
    console.log("logging org after");
    this.orgs$ = this.store.pipe(select(fromOrganisationStore.organisations));
    this.loading$ = this.store.pipe(select(fromOrganisationStore.organisationsLoading));
    console.log('org is in manager')
    this.orgs$.subscribe(val => console.log(val));
    this.columnConfig = [
      { header: 'Reference', key: 'organisationId'},
      { header: 'Address', key: 'address' },
      { header: 'Administrator', key: 'admin' },
      { header: 'Status', key: 'status' },
      { header: null, key: 'view', type: 'link' }
    ];
  }

}

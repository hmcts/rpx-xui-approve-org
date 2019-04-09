import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisationStore from '../../../org-manager/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import {Observable} from 'rxjs';
import { OrganisationSummary } from '../../models/organisation';
@Component({
  selector: 'app-prd-fee-accounts-component',
  templateUrl: './org-overview.component.html',
})

export class OrganisationOverviewComponent implements OnInit{
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  accounts$: Observable<Array<OrganisationSummary>>;
  loading$: Observable<boolean>;

  constructor(private store: Store<fromOrganisationStore.OrganisationState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationStore.LoadOrganisation());
    this.accounts$ = this.store.pipe(select(fromOrganisationStore.feeAccounts));
    this.loading$ = this.store.pipe(select(fromOrganisationStore.feeAccountsLoading));
    this.columnConfig = [
      { header: 'Reference', key: 'organisationId'},
      { header: 'Address', key: 'pbaNumber' },
      { header: 'Administrator', key: 'admin' },
      { header: 'Status', key: 'status' },
      { header: null, key: 'view', type: 'link' }
    ];
  }

}

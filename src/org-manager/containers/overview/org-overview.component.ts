import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromFeeAccountsStore from '../../../org-manager/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import {Observable} from 'rxjs';
import {PbaAccountsSummary} from '../../models/pba-accounts';
@Component({
  selector: 'app-prd-fee-accounts-component',
  templateUrl: './org-overview.component.html',
})

export class OrganisationOverviewComponent implements OnInit{
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  accounts$: Observable<Array<PbaAccountsSummary>>;
  loading$: Observable<boolean>;

  constructor(private store: Store<fromFeeAccountsStore.FeeAccountsState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromFeeAccountsStore.LoadFeeAccounts());
    this.accounts$ = this.store.pipe(select(fromFeeAccountsStore.feeAccounts));
    this.loading$ = this.store.pipe(select(fromFeeAccountsStore.feeAccountsLoading));
    this.columnConfig = [
      { header: 'Reference', key: 'organisationId'},
      { header: 'Address', key: 'pbaNumber' },
      { header: 'Administrator', key: 'admin' },
      { header: 'Status', key: 'status' },
      { header: null, key: 'view', type: 'link' }
    ];
  }

}

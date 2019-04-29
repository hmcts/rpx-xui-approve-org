import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromPendingOrg from '../../state/org-pending.reducer'
import * as pendingOrgActions from '../../state/actions/pendingOrg.actions'

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class PendingOverviewComponent implements OnInit{

  pendingOrgs: PendingOrganisation[];
  displayCode: boolean;
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  pendingOrgs$: Observable<Array<PendingOrganisation>>;

  constructor(private store: Store<fromPendingOrg.State>/*,private pendingOrganisationService: PendingOrganisationService*/) {}

  ngOnInit(): void {

    this.store.dispatch(new pendingOrgActions.Load());
    this.store.pipe(select(fromPendingOrg.getPendingOrgs))
    .subscribe((pendingOrgs: PendingOrganisation[]) => this.pendingOrgs = pendingOrgs);

    console.log('printing pending organisations')
    console.log(this.pendingOrgs);

   this.store.pipe(select(fromPendingOrg.getShowPendingOrgCode)).subscribe(
      showPendingOrgCode => this.displayCode = showPendingOrgCode
      );

      this.pendingOrgs$ = Observable.of(this.pendingOrgs);

      this.columnConfig = [
        { header: 'Reference', key: 'organisationId'},
        { header: 'Address', key: 'address' },
        { header: 'Administrator', key: 'admin' },
        { header: 'Status', key: 'status' },
        { header: null, key: 'view', type: 'link' }
      ];

  }

  checkChanged(value: boolean): void {
    this.store.dispatch(new pendingOrgActions.TogglePendingOrgCode(value))
  }

}


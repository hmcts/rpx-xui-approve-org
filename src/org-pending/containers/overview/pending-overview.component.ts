import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as pendingOrgActions from '../../store/actions/org-pending.actions';
import * as fromOrganisationPendingStore from '../../../org-pending/store';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class PendingOverviewComponent implements OnInit {

  pendingOrgs: PendingOrganisation[];
  displayCode: boolean;
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  pendingOrgs$: Observable<Array<PendingOrganisation>>;
  loading$: Observable<boolean>;

  constructor(private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationPendingStore.Load());
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs));
    //this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.organisationsLoading));
   this.store.pipe(select(fromOrganisationPendingStore.getShowPendingOrgCode)).subscribe(
      showPendingOrgCode => this.displayCode = showPendingOrgCode
      );

      //this.pendingOrgs$ = Observable.of(this.pendingOrgs);

      this.columnConfig = [
        { header: 'Reference', key: 'organisationId'},
        { header: 'Address', key: 'address' },
        { header: 'Administrator', key: 'admin' },
        { header: 'Status', key: 'status' },
        { header: null, key: 'view', type: 'link' }
      ];

  }

  checkChanged(value: boolean): void {
    this.store.dispatch(new pendingOrgActions.TogglePendingOrgCode(value));
  }

}


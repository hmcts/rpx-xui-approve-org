import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import * as fromRoot from '../../../app/store';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class OverviewComponent implements OnInit {

  pendingOrgs: any;
  displayCode: boolean;
  columnConfig: GovukTableColumnConfig[];
  tableRows: {}[];
  pendingOrgs$: any;
  loading$: Observable<boolean>;
  approveOrganisations: Array<any>;
  orgs: Observable<any>;
  constructor(private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisations());
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations));
    this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisationsLoading));

      this.columnConfig = [
        { header: null, key: null, type: 'checkbox'},
        { header: 'Reference', key: 'organisationId', type: 'multi-column', multiColumnMapping: 'id',
        class: 'govuk-caption-m govuk-!-font-size-16'},
        { header: 'Address', key: 'address' },
        { header: 'Administrator', key: 'admin', type: 'multi-column',
        multiColumnMapping: 'email', class: 'govuk-caption-m govuk-!-font-size-16' },
        { header: 'Status', key: 'status', type: 'styled', class: 'hmcts-badge'},
        { header: null, key: 'view', type: 'link' }
      ];

      this.pendingOrgs$.subscribe( x => console.log('x is',x.pendingOrganisations))
      this.pendingOrgs$.subscribe( x => console.log('x is',x.pendingOrganisations))
      this.pendingOrgs$.subscribe( x => this.orgs = x.pendingOrganisations)

  }

processCheckedOrgs(pendingOrgs) {
    console.log('in pending checked orgs are', pendingOrgs.value);
    // TO DO DISPATCH AN ACTION ETC HERE
    this.approveOrganisations = pendingOrgs.value;
    
}

activateOrganisations() {
  // TO DO NGRX NAVIGATE TO ACTIVATE ORG PAGE WITH PAYLOAD AS PENDING ORGS
  console.log('activate organisations');
  console.log('I will update store with', this.approveOrganisations);
  this.store.dispatch({
    type: 'TOGGLE_PRODUCT_CODE',
    payload: true
  });
}

onGoBack() {
  this.store.dispatch(new fromRoot.Back());
}

}


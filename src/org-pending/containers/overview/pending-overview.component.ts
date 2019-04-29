import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation, PendingOrganisationSummary } from 'src/org-pending/models/pending-organisation';
//import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
import { subscribeOn } from 'rxjs/operators';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromPendingOrganisationStore from '../../../org-pending/state/actions'
import * as fromPendingOrg from '../../state/org-pending.reducer'
import { PendingOrgActionTypes } from 'src/org-pending/state/actions/pendingOrg.actions';
import * as pendingOrgActions from '../../state/actions/pendingOrg.actions'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
  //providers: [PendingOrganisationService]
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

    //THE OLD WORKING WAY
    /*this.pendingOrganisationService.fetchPendingOrganisations().subscribe(
      (pendingOrgs: PendingOrganisation[]) => this.pendingOrgs= pendingOrgs
    );*/

    console.log('printing orgs')
    console.log(this.pendingOrgs);

   this.store.pipe(select(fromPendingOrg.getShowPendingOrgCode)).subscribe(
      showPendingOrgCode => this.displayCode = showPendingOrgCode
      );

      //USED TO WORK
      this.pendingOrgs$ = this.getProducts();
      //this.pendingOrgs$ = Observable.of(this.pendingOrgs);
      console.log('org is in pending')
      this.pendingOrgs$.subscribe(val => console.log(val));

      /*this.store.dispatch({
        type: 'SHOW_PENDING_ORG',
        payload: true
      })*/

      //this.store.dispatch(new fromPendingOrganisationStore.LoadPendingOrganisation());

      

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

  getProducts() {

    if(this.pendingOrgs != null) 
    {
        return Observable.of(this.pendingOrgs);
    } 

}
}


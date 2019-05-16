import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as pendingOrgActions from '../../store/actions/org-pending.actions';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

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
  emails = [{ email: "email1" }, { email: "email2" }, { email: "email3" }, { email: 'email4' }]
  myForm: FormGroup;


  constructor(private store: Store<fromOrganisationPendingStore.PendingOrganisationState>,private fb: FormBuilder) {}

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisationPendingStore.Load());
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs));
    //this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.organisationsLoading));
   /*this.store.pipe(select(fromOrganisationPendingStore.getShowPendingOrgCode)).subscribe(
      showPendingOrgCode => this.displayCode = showPendingOrgCode
      );*/

      //this.pendingOrgs$ = Observable.of(this.pendingOrgs);

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

      this.myForm = this.fb.group({
        useremail: this.fb.array([])
      });

  

  }

  checkChanged(value: boolean): void {
    this.store.dispatch(new pendingOrgActions.TogglePendingOrgCode(value));
  }

  displayCounter(count) {
    console.log('test',count);
}

onChange(email: string, isChecked: boolean) {
  const pendingOrgFormArray = <FormArray>this.myForm.controls.useremail;

  if (isChecked) {
    pendingOrgFormArray.push(new FormControl(email));
  } else {
    let index = pendingOrgFormArray.controls.findIndex(x => x.value == email)
    pendingOrgFormArray.removeAt(index);
  }
  console.log('forms',pendingOrgFormArray)
}




}


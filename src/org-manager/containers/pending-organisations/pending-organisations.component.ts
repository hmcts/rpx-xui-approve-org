import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import { PendingOverviewColumnConfig } from 'src/org-manager/config/pending-overview.config';
import { OrganisationVM, OrganisationSummary } from 'src/org-manager/models/organisation';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from 'events';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
})

export class PendingOrganisationsComponent implements OnInit, OnDestroy {

  columnConfig: GovukTableColumnConfig[];
  pendingOrgs$: any;
  loading$: Observable<boolean>;
  approveOrganisations: Array<OrganisationVM>;
  pendingOrganisations$: Array<OrganisationSummary>;
  subscription: Subscription;
  inputForm: FormGroup;
  valueChange = new EventEmitter();

  constructor(public store: Store<fromStore.OrganisationState>,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inputForm = this.fb.group({
      pendingOrgInputRadio: ['', Validators.required]
    });
    this.approveOrganisations = [];
    this.pendingOrgs$ = this.store.pipe(select(fromStore.getPendingOrganisationsArray));
    this.pendingOrgs$.subscribe(orgs => {
      if (orgs.length === 0) {
         this.store.dispatch(new fromRoot.Go({ path: ['/'] }));
      }
    });

    this.columnConfig = PendingOverviewColumnConfig;

    this.store.dispatch(new fromStore.ClearErrors());
  }

  activateOrganisations() {
    if (this.inputForm.controls.pendingOrgInputRadio.value) {
      this.approveOrganisations = [];
      this.approveOrganisations.push(this.inputForm.controls.pendingOrgInputRadio.value);
      this.store.dispatch(new fromStore.AddReviewOrganisations(this.approveOrganisations));
      this.store.dispatch(new fromRoot.Go({ path: ['pending-organisations/approve'] }));
    } else {
      this.store.dispatch(new fromStore.DisplayErrorMessageOrganisations('Select an organisation'));
    }
  }

  onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

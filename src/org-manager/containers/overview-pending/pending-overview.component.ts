import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import { PendingOverviewColumnConfig } from 'src/org-manager/config/pending-overview.config';
import { Organisation, OrganisationVM, OrganisationSummary } from 'src/org-manager/models/organisation';
import { OrganisationState } from 'src/org-manager/store/reducers/organisation.reducer';
import { FormArray, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class OverviewPendingComponent implements OnInit, OnDestroy {

  columnConfig: GovukTableColumnConfig[];
  pendingOrgs$: any;
  loading$: Observable<boolean>;
  approveOrganisations: Array<OrganisationVM>;
  pendingOrganisations$: Array<OrganisationSummary>;
  subscription: Subscription;
  inputForm: FormGroup;
  valueChange = new EventEmitter();

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationState>,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inputForm = this.fb.group({
      pendingOrgInputRadio: ['', Validators.required]
    });
    this.approveOrganisations = [];
    // this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs));
    this.subscription = this.pendingOrgs$.subscribe(pendingOrgs$ => {
      if (pendingOrgs$.pendingOrganisations.length > 0) {
        this.pendingOrganisations$ = pendingOrgs$.pendingOrganisations;
      } else {
        this.store.dispatch(new fromRoot.Go({ path: ['/'] }));
      }
    });

    // this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisationsLoading));

    this.columnConfig = PendingOverviewColumnConfig;

    this.store.dispatch(new fromOrganisationPendingStore.ClearErrors());
  }

  activateOrganisations() {
    if (this.inputForm.controls.pendingOrgInputRadio.value) {
      this.approveOrganisations = [];
      this.approveOrganisations.push(this.inputForm.controls.pendingOrgInputRadio.value);
      this.store.dispatch(new fromOrganisationPendingStore.AddReviewOrganisations(this.approveOrganisations));
      this.store.dispatch(new fromRoot.Go({ path: ['pending-organisations/approve'] }));
    } else {
      this.store.dispatch(new fromOrganisationPendingStore.DisplayErrorMessageOrganisations('Select an organisation'));
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

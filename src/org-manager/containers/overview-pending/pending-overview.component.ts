import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { EventEmitter } from 'events';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import { OrganisationSummary, OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { pendingOverviewColumnConfig } from '../../config/pending-overview.config';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class OverviewPendingComponent implements OnInit, OnDestroy {

  public columnConfig: GovukTableColumnConfig[];
  public pendingOrgs$: Observable<any>;
  public loading$: Observable<boolean>;
  public approveOrganisations: OrganisationVM[];
  public pendingOrganisations$: OrganisationSummary[];
  public subscription: Subscription;
  public inputForm: FormGroup;
  public valueChange = new EventEmitter();

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationState>,
              private readonly _fb: FormBuilder) {}

  public ngOnInit(): void {
    this.inputForm = this._fb.group({
      pendingOrgInputRadio: ['', Validators.required]
    });
    this.approveOrganisations = [];
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.getPendingOrgs));
    this.subscription = this.pendingOrgs$.subscribe(pendingOrgs => {
      if (pendingOrgs.pendingOrganisations.length > 0) {
        this.pendingOrganisations$ = pendingOrgs.pendingOrganisations;
      } else {
        this.store.dispatch(new fromRoot.Go({ path: ['/'] }));
      }
    });

    this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisationsLoading));

    this.columnConfig = pendingOverviewColumnConfig;

    this.store.dispatch(new fromOrganisationPendingStore.ClearErrors());
  }

  public activateOrganisations() {
    if (this.inputForm.controls.pendingOrgInputRadio.value) {
      this.approveOrganisations = [];
      this.approveOrganisations.push(this.inputForm.controls.pendingOrgInputRadio.value);
      this.store.dispatch(new fromOrganisationPendingStore.AddReviewOrganisations(this.approveOrganisations));
      this.store.dispatch(new fromRoot.Go({ path: ['pending-organisations/approve'] }));
    } else {
      this.store.dispatch(new fromOrganisationPendingStore.DisplayErrorMessageOrganisations('Select an organisation'));
    }
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

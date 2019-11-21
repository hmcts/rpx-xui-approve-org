import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';
import { PendingOverviewColumnConfig } from 'src/org-manager/config/pending-overview.config';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as fromOrganisation from '../../store/';
import {takeWhile} from 'rxjs/operators';


@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
})

export class PendingOrganisationsComponent implements OnInit, OnDestroy {

  columnConfig: GovukTableColumnConfig[];
  pendingOrgs$: Observable<OrganisationVM[]>;
  subscription: Subscription;
  inputForm: FormGroup;
  errorMessage$: Observable<string>;
  loading$: Observable<boolean>

  constructor(public store: Store<fromStore.OrganisationRootState>,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inputForm = this.fb.group({
      pendingOrgInputRadio: ['', Validators.required]
    });
    this.pendingOrgs$ = this.store.pipe(select(fromStore.getPendingOrganisationsArray));

    this.loading$ = this.store.pipe(select(fromOrganisation.getPendingLoaded));
    this.loading$.subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });

    // this.pendingOrgs$.subscribe(orgs => {
    //   if (orgs.length === 0) {
    //      this.store.dispatch(new fromRoot.Go({ path: ['/'] }));
    //   }
    // });

    this.columnConfig = PendingOverviewColumnConfig;
    this.errorMessage$ = this.store.pipe(select(fromStore.getErrorMessage));

    this.store.dispatch(new fromStore.ClearErrors());
  }

  activateOrganisations() {
    const {valid, value} = this.inputForm.controls.pendingOrgInputRadio;
    if (valid) {
      this.store.dispatch(new fromStore.AddReviewOrganisations(value));
      this.store.dispatch(new fromRoot.Go({ path: ['/approve-organisations'] }));
    } else {
      this.store.dispatch(new fromStore.DisplayErrorMessageOrganisations('Select an organisation'));
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

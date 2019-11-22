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

export class PendingOrganisationsComponent implements OnInit {
  public columnConfig: GovukTableColumnConfig[];
  public pendingOrgs$: Observable<OrganisationVM[]>;
  public inputForm: FormGroup;
  public errorMessage$: Observable<string>;
  public loaded$: Observable<boolean>;

  constructor(public store: Store<fromStore.OrganisationRootState>,
              private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.inputForm = this.fb.group({
      pendingOrgInputRadio: ['', Validators.required]
    });

    this.loaded$ = this.store.pipe(select(fromOrganisation.getPendingLoaded));
    this.loaded$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });

    this.pendingOrgs$ = this.store.pipe(select(fromStore.getPendingOrganisationsArray));
    this.columnConfig = PendingOverviewColumnConfig;
    this.errorMessage$ = this.store.pipe(select(fromStore.getErrorMessage));
    this.store.dispatch(new fromStore.ClearErrors());
  }

  public activateOrganisations() {
    const {valid, value} = this.inputForm.controls.pendingOrgInputRadio;
    if (valid) {
      this.store.dispatch(new fromStore.AddReviewOrganisations(value));
      this.store.dispatch(new fromRoot.Go({ path: ['/approve-organisations'] }));
    } else {
      this.store.dispatch(new fromStore.DisplayErrorMessageOrganisations('Select an organisation'));
    }
  }

}

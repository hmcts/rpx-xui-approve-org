import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GovukTableColumnConfig } from '@hmcts/rpx-xui-common-lib/lib/gov-ui/components/gov-uk-table/gov-uk-table.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/of';
import {takeWhile} from 'rxjs/operators';
import { PendingOverviewColumnConfig } from 'src/org-manager/config/pending-overview.config';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../../org-manager/store';
import * as fromOrganisation from '../../store/';

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
  public activeOrgsCount$: Observable<number>;
  public activeLoaded$: Observable<boolean>;
  public searchString = '';

  constructor(public store: Store<fromStore.OrganisationRootState>,
              private readonly fb: FormBuilder) {}

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

    this.activeLoaded$ = this.store.pipe(select(fromOrganisation.getActiveLoaded));
    this.activeLoaded$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
      }
    });

    this.activeOrgsCount$ = this.store.pipe(select(fromOrganisation.activeOrganisationsCount));
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

  public submitSearch(searchString: string) {
    this.searchString = searchString;
  }

}

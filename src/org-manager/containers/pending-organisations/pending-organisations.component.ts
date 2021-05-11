import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GovukTableColumnConfig } from '@hmcts/rpx-xui-common-lib/lib/gov-ui/components/gov-uk-table/gov-uk-table.component';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import {takeWhile} from 'rxjs/operators';
import { PendingOverviewColumnConfig } from 'src/org-manager/config/pending-overview.config';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromStore from '../../../org-manager/store';
import * as fromOrganisation from '../../store/';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
})

export class PendingOrganisationsComponent implements OnInit {
  public columnConfig: GovukTableColumnConfig[];
  public pendingOrgs$: Observable<OrganisationVM[]>;

  public loaded$: Observable<boolean>;
  public pendingSearchString$: Observable<string>;

  public activeOrgsCount$: Observable<number>;
  public activeLoaded$: Observable<boolean>;

  constructor(public store: Store<fromStore.OrganisationRootState>,
              private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
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
    this.store.dispatch(new fromStore.ClearErrors());
    this.pendingSearchString$ = this.store.pipe(select(fromOrganisation.getPendingSearchString));
  }

  public submitSearch(searchString: string) {
    this.store.dispatch(new fromOrganisation.UpdatePendingOrganisationsSearchString(searchString));
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationParameter } from '@hmcts/rpx-xui-common-lib';
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
  public inputForm: FormGroup;
  public loaded$: Observable<boolean>;
  public pendingSearchString$: Observable<string>;
  public activeOrgsCount$: Observable<number>;
  public activeLoaded$: Observable<boolean>;
  public pagination: PaginationParameter;
  public moreResultsToGo: boolean = true;

  private totalResults: number = 0;

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
    this.store.dispatch(new fromStore.ClearErrors());
    this.pendingSearchString$ = this.store.pipe(select(fromOrganisation.getPendingSearchString));
    this.pagination = {
      page_number: 1,
      page_size: 25
    };
  }

  public submitSearch(searchString: string) {
    this.pagination.page_number = 1;
    this.store.dispatch(new fromOrganisation.UpdatePendingOrganisationsSearchString(searchString));
  }

  public getPreviousResultsPage(): void {
    if (this.pagination.page_number > 1) {
      this.pagination.page_number = this.pagination.page_number - 1;
    } else {
      this.moreResultsToGo = true;
    }
  }

  public getNextResultsPage(): void {
    const maxPages = Math.ceil(this.totalResults / this.pagination.page_size);
    if (this.pagination.page_number < maxPages) {
      this.pagination.page_number = this.pagination.page_number + 1;
    } else {
      this.moreResultsToGo = false;
    }
  }

  public getFirstResult(orgs: OrganisationVM[]): number {
    if (orgs && orgs.length > 0) {
      const currentPage = (this.pagination.page_number ? this.pagination.page_number  : 1);
      if (currentPage === 1) {
        return currentPage;
      }
      return (currentPage - 1) * this.pagination.page_size + 1;
    }
    return 0;
  }

  public getLastResult(orgs: OrganisationVM[]): number {
    if (orgs && orgs.length > 0) {
      const currentPage = (this.pagination.page_number ? this.pagination.page_number  : 1);
      return (currentPage) * this.pagination.page_size;
    }
    return 0;
  }

  public getTotalResults(orgs: OrganisationVM[]): number {
    if (orgs && orgs.length > 0) {
      this.totalResults = orgs.length;
      return orgs.length;
    }
    return 0;
  }

}

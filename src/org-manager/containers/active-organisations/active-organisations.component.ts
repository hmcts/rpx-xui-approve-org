import { Component, OnInit } from '@angular/core';
import { PaginationParameter } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {takeWhile} from 'rxjs/operators';
import * as fromOrganisation from '../../../org-manager/store/';
import {OrganisationVM} from '../../models/organisation';

/**
 * Bootstraps Active Organisations
 */
@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './active-organisations.component.html',
})

export class ActiveOrganisationsComponent implements OnInit {
  public orgs$: Observable<OrganisationVM[]>;
  public loading$: Observable<boolean>;
  public activeSearchString$: Observable<string>;
  public pagination: PaginationParameter;
  public moreResultsToGo: boolean = true;

  private totalResults: number = 0;

  constructor(
    public readonly store: Store<fromOrganisation.OrganisationRootState>,
  ) { }

  public ngOnInit(): void {
    this.store.pipe(select(
      fromOrganisation.getActiveLoaded),
      takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
      }
    });

    this.orgs$ = this.store.pipe(select(fromOrganisation.getActiveOrganisationArray));
    this.loading$ = this.store.pipe(select(fromOrganisation.getActiveLoading));
    this.activeSearchString$ = this.store.pipe(select(fromOrganisation.getActiveSearchString));
    this.pagination = {
      page_number: 1,
      page_size: 25
    };
  }

  public submitSearch(searchString: string) {
    this.pagination.page_number = 1;
    this.store.dispatch(new fromOrganisation.UpdateActiveOrganisationsSearchString(searchString));
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

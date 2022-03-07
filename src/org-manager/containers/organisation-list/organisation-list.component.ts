import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService, PaginationParameter } from '@hmcts/rpx-xui-common-lib';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppUtils } from '../../../app/utils/app-utils';
import { SortOrder } from '../../../enums/sort-order';
import SortField from '../../../models/common/sort-field.model';
import { SearchOrganisationRequest, SortParameter } from '../../../models/dtos';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { handleFatalErrors, WILDCARD_SERVICE_DOWN } from '../../../shared/utils/handle-fatal-errors';

import { OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services';

export abstract class OrganisationListComponent implements OnInit, OnDestroy {

  public searchString: string = '';
  public sortedBy: SortField;
  public pagination: PaginationParameter;
  public showSpinner$: Observable<boolean>;
  public organisationsLoaded: boolean = false;
  private organisationSubscription: Subscription;
  public view: string;
  public organisations: OrganisationVM[];
  public organisationCount: number;

  constructor(
    protected router: Router,
    protected ref: ChangeDetectorRef,
    protected organisationService: OrganisationService,
    protected loadingService: LoadingService,
    protected sessionStorageService: SessionStorageService
  ) {
  }

  public ngOnInit(): void {
    this.loadOrganisations();
  }

  private loadOrganisations(): void {
    this.organisationSubscription = this.organisationService.organisationSearchStringChange().subscribe(
      searchString => {
        this.sortedBy = {
          fieldName: 'organisationId',
          order: SortOrder.ASC
        };
        this.sessionStorageService.setItem('searchString', searchString);
        this.showSpinner$ = this.loadingService.isLoading;
        const loadingToken = this.loadingService.register();
        this.performSearchPagination(searchString).pipe(take(1)).subscribe(result => {
          this.loadingService.unregister(loadingToken);
          this.organisations = AppUtils.mapOrganisations(result.organisations);
          this.organisationCount = result.total_records;
          this.organisationsLoaded = true;
          this.ref.detectChanges();
        }, error => {
          this.loadingService.unregister(loadingToken);
          handleFatalErrors(error.status, this.router, WILDCARD_SERVICE_DOWN);
        });
      });
    this.organisationService.setOrganisationSearchString(this.sessionStorageService.getItem('searchString'));
  }

  public performSearchPagination(searchString): Observable<any> {
    const searchRequest = this.getSearchOrganisationRequestPagination(searchString);
    return this.organisationService.searchOrganisationWithPagination({ searchRequest, view: this.view });
  }

  public getSearchOrganisationRequestPagination(searchString): SearchOrganisationRequest {
    return {
      search_filter: searchString,
      sorting_parameters: [this.getSortParameter()],
      pagination_parameters: this.getPaginationParameter()
    };
  }

  public getSortParameter(): SortParameter {
    return {
      sort_by: this.sortedBy.fieldName,
      sort_order: this.sortedBy.order
    };
  }

  public getPaginationParameter(): PaginationParameter {
    return { ...this.pagination };
  }

  public ngOnDestroy(): void {
    if (this.organisationSubscription) {
      this.organisationSubscription.unsubscribe();
    }
  }

}

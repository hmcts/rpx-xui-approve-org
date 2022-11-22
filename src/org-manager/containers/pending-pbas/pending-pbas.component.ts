import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '@hmcts/rpx-xui-common-lib';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SortOrder } from '../../../enums/sort-order';
import { PaginationParameter } from '../../../models/common/pagination.model';
import SortField from '../../../models/common/sort-field.model';
import { SearchPBARequest, SortParameter } from '../../../models/dtos';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { handleFatalErrors, WILDCARD_SERVICE_DOWN } from '../../../shared/utils/handle-fatal-errors';

import { OrganisationService, PbaService } from '../../services';
import { PBANumberModel, RenderableOrganisation } from './models';
import { DrillDownSearch } from '../../models/DrillDownSearch';

@Component({
  selector: 'app-pending-pbas',
  templateUrl: './pending-pbas.component.html',
})
export class PendingPBAsComponent implements OnInit, OnDestroy {
  public static PENDING_STATUS: string = 'pending';
  public sortedBy: SortField;
  public pagination: PaginationParameter;
  private organisationSearchSubscription: Subscription;
  private resetPaginationSubscription: Subscription;
  public showSpinner$: Observable<boolean>;
  public pendingPBAsCount: number;
  public view: string = 'pending';
  public pbasLoaded: boolean = false;
  public orgsWithPendingPBAs: RenderableOrganisation[];

  constructor(
    private readonly organisationService: OrganisationService,
    private readonly pbaService: PbaService,
    private readonly router: Router,
    protected loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService
  ) { }

  public ngOnInit(): void {
    this.loadPendingPBAs();
  }

  private loadPendingPBAs(): void {
    this.resetPaginationSubscription = this.organisationService.paginationParametersReset().subscribe(() => {
      this.resetPaginationParameters();
    });

    this.organisationSearchSubscription = this.organisationService.organisationSearchStringChange().subscribe(
      searchString => {
        this.sortedBy = {
          fieldName: 'organisationId',
          order: SortOrder.ASC
        };
        this.sessionStorageService.setItem('searchString', searchString);
        this.showSpinner$ = this.loadingService.isLoading;
        const loadingToken = this.loadingService.register();
        this.performSearchPagination('active', searchString).pipe(
          take(1)).subscribe({
          next: (result: any) => {
              this.loadingService.unregister(loadingToken);
              this.orgsWithPendingPBAs = [];
              result.organisations.forEach(renderableOrganisation => {
                this.orgsWithPendingPBAs.push({
                  organisationId: renderableOrganisation.organisationIdentifier ? renderableOrganisation.organisationIdentifier : '',
                  admin: `${renderableOrganisation.superUser.firstName} ${renderableOrganisation.superUser.lastName}`,
                  name: renderableOrganisation ? renderableOrganisation.organisationName : '',
                  pbaNumbers: renderableOrganisation ? renderableOrganisation.pbaNumbers : [],
                  adminEmail: renderableOrganisation.superUser ? renderableOrganisation.superUser.email : '',

                } as RenderableOrganisation);
              });
              this.pendingPBAsCount = result.total_records;
              this.pbasLoaded = true;
          },
          error: (error: any) => {
            this.loadingService.unregister(loadingToken);
            handleFatalErrors(error.status, this.router, WILDCARD_SERVICE_DOWN);
          }
        });
      });
    this.resetPaginationParameters();
    this.organisationService.setOrganisationSearchString(this.sessionStorageService.getItem('searchString'));
  }

  public performSearchPagination(searchString, pbaSearch?: string): Observable<any> {
    const searchRequest = this.getSearchPBARequestPagination(searchString, pbaSearch);
    return this.pbaService.searchPbasWithPagination({ searchRequest, view: this.view });
  }

  public getSearchPBARequestPagination(searchString, pbaSearch?: string): SearchPBARequest {
    const drillDownSearch = pbaSearch ? [
      {
        field_name: 'pbaPendings',
        search_filter: pbaSearch
      } as DrillDownSearch
    ] : undefined;
    return {
      search_filter: searchString,
      sorting_parameters: [this.getSortParameter()],
      pagination_parameters: this.getPaginationParameter(),
      drill_down_search: drillDownSearch
    } as SearchPBARequest;
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

  public resetPaginationParameters(): void {
    this.pagination = {
      page_number: 1,
      page_size: 10
    };
  }

  public onPaginationHandler(pageNumber: number): void {
    this.pagination.page_number = pageNumber;
    this.organisationService.setOrganisationSearchString(this.sessionStorageService.getItem('searchString'));
  }

  /**
   * For a given set of PBA numbers, choose the earliest dateCreated.
   * @param pbaNumbers The numbers, each of which will have a dateCreated property.
   */
  public getReceivedDate(pbaNumbers: PBANumberModel[]): string {
    return pbaNumbers.reduce((currentEarliest: string, number: PBANumberModel) => {
      const epoch = Date.parse(number.dateCreated);
      const earliest = Date.parse(currentEarliest);
      if (epoch < earliest) {
        return new Date(epoch).toISOString();
      }
      return currentEarliest;
    }, new Date().toISOString());
  }

  public ngOnDestroy(): void {
    if (this.organisationSearchSubscription) {
      this.organisationSearchSubscription.unsubscribe();
    };

    if (this.resetPaginationSubscription) {
      this.resetPaginationSubscription.unsubscribe();
    }
  }
}

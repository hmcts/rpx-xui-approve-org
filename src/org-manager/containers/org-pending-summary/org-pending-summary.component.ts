import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { SummaryComponent } from 'src/org-manager/components';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-org-pending-summary',
  templateUrl: './org-pending-summary.component.html'
})
export class OrgPendingSummaryComponent implements OnInit, OnDestroy {
  public orgSummary$: any;
  public vehicles: SummaryComponent;
  public loading$: Observable<boolean>;
  public $routeSubscription: Subscription;
  public pageId: string;

  constructor(
    private readonly _store: Store<fromOrganisationPendingStore.OrganisationState>) { }

  public ngOnInit() {

    this.orgSummary$ = this._store.pipe(select(fromOrganisationPendingStore.getSingleOrgOverview));
    this.loading$ = this._store.pipe(select(fromOrganisationPendingStore.orgSummaryLoading));

    this.$routeSubscription = this._store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
        this.pageId = routeParams.id;
        this._store.dispatch(new fromOrganisationPendingStore.LoadSingleOrg({ id: this.pageId
        }));
      }
    });
  }

  public ngOnDestroy() {
    this._store.dispatch(new fromOrganisationPendingStore.ResetSingleOrg({}));
    this.$routeSubscription.unsubscribe();
  }
}

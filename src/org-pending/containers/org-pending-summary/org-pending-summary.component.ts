import {Component, OnDestroy, OnInit} from '@angular/core';
import * as fromfeatureStore from '../../store';
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-org-pending-summary',
  templateUrl: './org-pending-summary.component.html'
})
export class OrgPendingSummaryComponent implements OnInit {
  orgSummary$: Observable<any>;
  loading$: Observable<boolean>;
  orgSummary = {};
  errorMessage = '';
  $routeSubscription: Subscription;
  pageId: string;
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromfeatureStore.PendingOrganisationState>) { }

  ngOnInit() {

    //this.orgSummary$ = this.store.pipe(select(fromfeatureStore.getSingleOrgOverview));
    //this.loading$ = this.store.pipe(select(fromfeatureStore.orgSummaryLoading));

    /*this.$routeSubscription = this.store.pipe(select(fromfeatureStore.getCurrentPage)).subscribe((routeParams) => {
      if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
        this.pageId = routeParams.id;
        this.store.dispatch(new fromfeatureStore.LoadSingleOrg({ id: this.pageId
        }));
      }
    });

  }
  ngOnDestroy() {
    this.store.dispatch(new fromfeatureStore.ResetSingleOrg({}));
  }*/
}
}

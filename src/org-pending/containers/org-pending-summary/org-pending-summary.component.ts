import {Component, OnDestroy, OnInit} from '@angular/core';
import * as fromfeatureStore from '../../../org-manager/store'
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import { SummaryComponent } from 'src/org-manager/containers';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';

@Component({
  selector: 'app-org-pending-summary',
  templateUrl: './org-pending-summary.component.html'
})
export class OrgPendingSummaryComponent implements OnInit {
  orgSummary$: Observable<any>;
  vehicles: SummaryComponent;
  loading$: Observable<boolean>;
  orgSummary = {};
  errorMessage = '';
  $routeSubscription: Subscription;
  pageId: string;
  x: any;
  y: Observable<any>;
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromfeatureStore.OrganisationState>) { }

  ngOnInit() {

    this.orgSummary$ = this.store.pipe(select(fromfeatureStore.getSingleOrgOverview));
    //this.loading$ = this.store.pipe(select(fromfeatureStore.orgSummaryLoading));

    this.$routeSubscription = this.store.pipe(select(fromfeatureStore.getCurrentPage)).subscribe((routeParams) => {
      if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
        this.pageId = routeParams.id;
        this.store.dispatch(new fromfeatureStore.LoadSingleOrg({ id: this.pageId
        }));
      }
    });

    this.orgSummary$.subscribe( x => this.x = x.name)
    this.orgSummary$.subscribe( x => this.y = x)

  }

}

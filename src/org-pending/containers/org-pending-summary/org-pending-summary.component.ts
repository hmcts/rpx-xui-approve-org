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
  orgSummary$: any;
  vehicles: SummaryComponent;
  loading$: Observable<boolean>;
  orgSummary = {};
  errorMessage = '';
  $routeSubscription: Subscription;
  pageId: string;
  xs: Array<any>;
  y: Observable<any>;
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) { }

  ngOnInit() {

    //this.orgSummary$ = this.store.pipe(select(fromOrganisationPendingStore.getSingleOrgState));
    this.orgSummary$ = this.store.pipe(select(fromOrganisationPendingStore.getSingleOrgOverview));
    this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.orgSummaryLoading));

    this.$routeSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
        this.pageId = routeParams.id;
        this.store.dispatch(new fromOrganisationPendingStore.LoadSingleOrg({ id: this.pageId
        }));
      }
    });

    //this.orgSummary$.subscribe( x => this.x = x.name)
    //this.orgSummary$.subscribe( x => this.y = x)
   this.orgSummary$.subscribe(x=>console.log('here',x))
     this.orgSummary$.subscribe( x => this.xs = x)
     //this.loading$.subscribe(x=>console.log('here',x))

  }

}

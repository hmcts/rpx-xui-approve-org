import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import { SummaryComponent } from 'src/org-manager/containers';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';

@Component({
  selector: 'app-org-pending-summary',
  templateUrl: './org-pending-summary.component.html'
})
export class OrgPendingSummaryComponent implements OnInit {
  orgSummary$: any;
  vehicles: SummaryComponent;
  loading$: Observable<boolean>;
  $routeSubscription: Subscription;
  pageId: string;
  constructor(
    private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) { }

  ngOnInit() {

    this.orgSummary$ = this.store.pipe(select(fromOrganisationPendingStore.getSingleOrgOverview));
    this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.orgSummaryLoading));

    this.$routeSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
        this.pageId = routeParams.id;
        this.store.dispatch(new fromOrganisationPendingStore.LoadSingleOrg({ id: this.pageId
        }));
      }
    });
  }

}

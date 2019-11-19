import {Component, OnInit, OnDestroy} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { SummaryComponent } from 'src/org-manager/components';

@Component({
  selector: 'app-org-pending-summary',
  templateUrl: './org-pending-summary.component.html'
})
export class OrgPendingSummaryComponent implements OnInit, OnDestroy {
  orgSummary$: any;
  vehicles: SummaryComponent;
  loading$: Observable<boolean>;
  $routeSubscription: Subscription;
  pageId: string;
  constructor(
    private store: Store<fromOrganisationPendingStore.OrganisationState>) { }

  ngOnInit() {

    // this.$routeSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
    //   if (routeParams.id && routeParams.id !== this.pageId) { // TODO see why double call.
    //     this.pageId = routeParams.id;
    //     this.store.dispatch(new fromOrganisationPendingStore.LoadSingleOrg({ id: this.pageId
    //     }));
    //   }
    // });
  }

ngOnDestroy() {
  // this.store.dispatch(new fromOrganisationPendingStore.ResetSingleOrg({}));
  this.$routeSubscription.unsubscribe();
}
}

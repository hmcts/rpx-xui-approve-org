import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import * as fromRoot from '../../../app/store';
import { PendingOverviewColumnConfig } from '../../../org-pending/config/pending-overview.config';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
})

export class OverviewComponent implements OnInit {

  columnConfig: GovukTableColumnConfig[];
  pendingOrgs$: any;
  loading$: Observable<boolean>;
  approveOrganisations: Array<PendingOrganisation>;
  pendingOrganisations$: Observable<PendingOrganisation>;
  constructor(private store: Store<fromOrganisationPendingStore.PendingOrganisationState>) { }

  ngOnInit(): void {
    this.approveOrganisations = [];
    this.pendingOrgs$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisations));
    this.pendingOrgs$.subscribe(pendingOrgs$ => this.pendingOrganisations$ = pendingOrgs$.pendingOrganisations);
    this.loading$ = this.store.pipe(select(fromOrganisationPendingStore.pendingOrganisationsLoading));

    this.columnConfig = PendingOverviewColumnConfig;

  }

  processCheckedOrgs(pendingOrgs) {
    this.approveOrganisations = pendingOrgs.value;
    this.store.dispatch(new fromOrganisationPendingStore.AddReviewOrganisations(pendingOrgs.value));
  }

  activateOrganisations() {
    if (this.approveOrganisations.length > 0) {
      this.store.dispatch(new fromRoot.Go({ path: ['pending-organisations/approve'] }));
    }
  }

  onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

}


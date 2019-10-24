import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

/**
 * Bootstraps the Summary Components
 */
@Component({
  selector: 'app-prd-summary-component',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {

  @Input() public data: OrganisationVM;
  public $orgSubscription: Subscription;

  constructor(
    public store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  public ngOnInit(): void {
    this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedOrganisation))
      .subscribe();
  }

  public ngOnDestroy(): void {
    if (this.$orgSubscription) {
      this.$orgSubscription.unsubscribe();
    }
  }
}

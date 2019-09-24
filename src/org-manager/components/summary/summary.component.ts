import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM, OrganisationSummary} from 'src/org-manager/models/organisation';
import { Subscription } from 'rxjs';
/**
 * Bootstraps the Summary Components
 */
@Component({
  selector: 'app-prd-summary-component',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {

  @Input() data: OrganisationVM;
  $orgSubscription: Subscription;
  dxNumber: string;
  dxExchange: string;

  constructor(
    public store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  ngOnInit(): void {
    this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedOrganisation))
      .subscribe();
  }
  ngOnDestroy(): void {
    if (this.$orgSubscription) {
      this.$orgSubscription.unsubscribe();
    }
  }
}

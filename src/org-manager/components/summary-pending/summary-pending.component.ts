import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { OrganisationVM, OrganisationSummary } from 'src/org-manager/models/organisation';
import { Subscription } from 'rxjs';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-org-summary-component',
  templateUrl: './summary-pending.component.html',
  styleUrls: ['./summary-pending.component.scss']
})
export class SummaryPendingComponent implements OnInit, OnDestroy {

  @Input() data: OrganisationVM;
  $pageSubscription: Subscription;
  $orgSubscription: Subscription;
  dxNumber: string;
  dxExchange: string;

  constructor(
    private store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  ngOnInit(): void {

    this.$pageSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedPendingOrganisation(routeParams.id))).
      subscribe((data: OrganisationSummary[]) => {
        this.data = data.filter(x => x.organisationId === routeParams.id)[0];
        this.dxNumber = this.data.dxNumber[0].dxNumber;
        this.dxExchange = this.data.dxNumber[0].dxNumber;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.$pageSubscription) {
      this.$pageSubscription.unsubscribe();
    }
    if (this.$orgSubscription) {
      this.$orgSubscription.unsubscribe();
    }
  }
}

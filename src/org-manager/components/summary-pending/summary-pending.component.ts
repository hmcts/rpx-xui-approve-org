import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { OrganisationSummary, OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-org-summary-component',
  templateUrl: './summary-pending.component.html',
  styleUrls: ['./summary-pending.component.scss']
})
export class SummaryPendingComponent implements OnInit, OnDestroy {

  @Input() public data: OrganisationVM;
  public $pageSubscription: Subscription;
  public $orgSubscription: Subscription;
  public dxNumber: string;
  public dxExchange: string;

  constructor(
    public store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  public ngOnInit(): void {
    this.$pageSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedPendingOrganisation(routeParams.id))).
      subscribe((data: OrganisationSummary[]) => {
        this.data = data.filter(x => x.organisationId === routeParams.id)[0];
        this.dxNumber = this.data.dxNumber[0].dxNumber;
        this.dxExchange = this.data.dxNumber[0].dxExchange;
      });
    });
  }

  public ngOnDestroy(): void {
    if (this.$pageSubscription) {
      this.$pageSubscription.unsubscribe();
    }
    if (this.$orgSubscription) {
      this.$orgSubscription.unsubscribe();
    }
  }
}

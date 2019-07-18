import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {SingleOrgSummary} from '../../models/single-org-summary';
import * as fromFeature from '../../store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM, OrganisationSummary, Organisation } from 'src/org-manager/models/organisation';
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
  $pageSubscription: Subscription;
  $orgSubscription: Subscription;
  dxNumber: string;
  dxExchange: string;

  constructor(
    private store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  ngOnInit(): void {
    this.$pageSubscription = this.store.pipe(select(fromOrganisationPendingStore.getCurrentPage)).subscribe((routeParams) => {
      this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedOrganisation(routeParams.id))).
      subscribe((data: OrganisationSummary[]) => {
        debugger
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

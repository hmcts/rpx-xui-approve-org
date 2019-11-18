import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import { Subscription } from 'rxjs';
/**
 * Bootstraps Organisation Details
*/
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html',
  styleUrls: ['./organisation-details.component.scss']
})
export class OrganisationDetailsComponent implements OnInit, OnDestroy {

  @Input() data: OrganisationVM;
  $orgSubscription: Subscription;
  dxNumber: string;
  dxExchange: string;

  constructor(
    public store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  ngOnInit(): void {
    this.$orgSubscription = this.store.pipe(select(fromOrganisationPendingStore.selectedOrganisation))
      .subscribe(console.log);
  }
  ngOnDestroy(): void {

  }
}

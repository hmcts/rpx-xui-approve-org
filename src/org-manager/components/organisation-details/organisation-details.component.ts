import {Component, OnInit, Input} from '@angular/core';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import { Observable } from 'rxjs';

/**
 * Bootstraps Organisation Details
*/
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html',
  styleUrls: ['./organisation-details.component.scss']
})
export class OrganisationDetailsComponent implements OnInit {

  @Input() data: OrganisationVM;
  orgSubscription$: Observable<OrganisationVM>; // TODO CHANGE TYPINGS
  dxNumber: string;
  dxExchange: string;

  constructor(
    public store: Store<fromOrganisationPendingStore.OrganisationState>
  ) {}

  ngOnInit(): void {
    this.orgSubscription$ = this.store.pipe(select(fromOrganisationPendingStore.selectedOrganisation));
  }

}

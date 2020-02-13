import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';
import * as fromOrganisation from '../../store';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details-info',
  templateUrl: './organisation-details-info.component.html'
})
export class OrganisationDetailsInfoComponent {

  @Input() public org: OrganisationVM;
  @Output() public approveEvent: EventEmitter<OrganisationVM> = new EventEmitter();

  constructor() {}

  public approveOrganisation(data: OrganisationVM) {
    console.log('info approve org');
    if (data) {
      this.approveEvent.emit(data);
      // this.store.dispatch(new fromStore.AddReviewOrganisations(data));
    }
  }

}


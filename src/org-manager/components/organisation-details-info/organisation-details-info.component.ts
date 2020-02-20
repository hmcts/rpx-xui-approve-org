import {Component, EventEmitter, Input, Output} from '@angular/core';
import { OrganisationVM} from 'src/org-manager/models/organisation';

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
    if (data) {
      this.approveEvent.emit(data);
    }
  }

}


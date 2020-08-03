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
  @Output() public deleteEvent: EventEmitter<OrganisationVM> = new EventEmitter();

  constructor() {}

  /**
   * Approve Organisation
   *
   * Send an event to the parent to approve the organisation.
   *
   * TODO: Requires unit test.
   *
   * @param { OrganisationVM } data
   */
  public approveOrganisation(data: OrganisationVM) {
    if (data) {
      this.approveEvent.emit(data);
    }
  }

  /**
   * Delete Organisation
   *
   * Send an event to the parent to delete the organisation.
   *
   * TODO: Requires unit test.
   *
   * @param { OrganisationVM } data
   */
  public deleteOrganisation(data: OrganisationVM) {
    if (data) {
      this.deleteEvent.emit(data);
    }
  }
}


import {Component, OnInit, Input} from '@angular/core';
import { OrganisationUser } from 'src/org-manager/models/organisation';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-users',
  templateUrl: './organisation-users.component.html'
})
export class OrganisationUsersComponent implements OnInit {
  @Input() public users: OrganisationUser[];
  constructor() {}

  public ngOnInit(): void {
  }

}


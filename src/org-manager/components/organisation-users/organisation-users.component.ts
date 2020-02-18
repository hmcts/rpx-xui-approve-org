import {Component, OnInit, Input} from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-users',
  templateUrl: './organisation-users.component.html'
})
export class OrganisationUsersComponent implements OnInit {
  @Input() public users: User[];
  constructor() {}

  public ngOnInit(): void {
  }

}


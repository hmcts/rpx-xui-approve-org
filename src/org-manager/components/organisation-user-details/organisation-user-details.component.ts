import {Component, OnInit, Input} from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';

@Component({
  selector: 'app-org-user-details',
  templateUrl: './organisation-user-details.component.html'
})
export class OrganisationUserDetailsComponent implements OnInit {
  @Input() public user: User;
  constructor() {}

  public ngOnInit(): void {
  }

}


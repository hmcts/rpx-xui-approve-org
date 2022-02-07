import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pba-account-approval',
  templateUrl: './pba-account-approval.component.html'
})
export class PBAAccountApprovalComponent {

  @Input() public pbaNumber: string;
  @Input() public pbaNumbers: string;
  @Input() public accountName: string;
  @Input() public organisationId: string;

  constructor() {

  }
}

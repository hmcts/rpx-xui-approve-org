import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pba-account-decision',
  templateUrl: './pba-account-decision.component.html',
  standalone: false
})
export class PBAAccountDecisionComponent {
  @Input() public accountName: string;
  @Input() public decision: string;
  @Input() public organisationId: string;
  @Input() public pbaNumber: string;
}

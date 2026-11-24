import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pba-account-decision',
  templateUrl: './pba-account-decision.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class PBAAccountDecisionComponent {
  @Input() public accountName: string;
  @Input() public decision: string;
  @Input() public organisationId: string;
  @Input() public pbaNumber: string;
}

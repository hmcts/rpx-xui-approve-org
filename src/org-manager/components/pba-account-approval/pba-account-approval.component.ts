import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pba-account-approval',
  templateUrl: './pba-account-approval.component.html'
})
export class PBAAccountApprovalComponent {

  @Input() public accountName: string;
  @Input() public organisationId: string;
  @Input() public pbaNumber: string;
  @Input() public pbaNumbers: string;
  @Input() public pbaStatus: string;
  @Input() public formGroup: any;
  @Input() public submitted?: boolean = true;
  @Output() public selectOptionChanged = new EventEmitter<{ name: string, value: string }>();

  public selectOption($event): void {
    this.selectOptionChanged.emit({ name: this.pbaNumber, value: $event.target.value });
  }
}

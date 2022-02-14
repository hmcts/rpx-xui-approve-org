import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  @Output() selectOptionChanged = new EventEmitter<{ name: string, value: string }>();
  constructor() {

  }

  public selectOption($event): void {
    this.selectOptionChanged.emit({ name: this.pbaNumber, value: $event.target.value })
  }
}

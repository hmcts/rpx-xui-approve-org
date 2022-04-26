import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-pba-account-approval',
  templateUrl: './pba-account-approval.component.html'
})
export class PBAAccountApprovalComponent implements OnInit {

  @Input() public accountName: string;
  @Input() public organisationId: string;
  @Input() public pbaNumber: string;
  @Input() public pbaNumbers: string;
  @Input() public pbaStatus: string;
  @Input() public formGroup: any;
  @Input() public submitted?: boolean = true;
  @Output() public selectOptionChanged = new EventEmitter<{ name: string, value: string }>();
  constructor( ) {
  }

  public ngOnInit(): void {
    if (this.pbaNumber) {
   // this.formGroup.get(this.pbaNumber).setValidators(Validators.required);
    }
  }

  public selectOption($event): void {
    this.selectOptionChanged.emit({ name: this.pbaNumber, value: $event.target.value });
  }
}

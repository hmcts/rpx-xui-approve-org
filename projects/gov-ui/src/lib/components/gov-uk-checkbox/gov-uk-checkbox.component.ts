import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'lib-gov-checkbox',
  templateUrl: './gov-uk-checkbox.component.html',
})
export class GovUkCheckboxComponent {
  constructor() { }

  @Output() valueChange = new EventEmitter();
  checkboxInputArray: Array<any>;

  @Input() input: any;

onInputChange(isChecked: boolean, input: any) {

  this.checkboxInputArray = [{ input: {input}, isChecked: {isChecked} }];

  this.valueChange.emit(this.checkboxInputArray[0]);
}

}

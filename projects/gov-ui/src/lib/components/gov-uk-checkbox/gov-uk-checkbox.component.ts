import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'lib-gov-checkbox',
  templateUrl: './gov-uk-checkbox.component.html',
})
export class GovUkCheckboxComponent {
  constructor () { }

  @Output() valueChange = new EventEmitter();
  checkboxInputArray: Array<any>;

  @Input() inputArray: Array<any>

onInputChange(isChecked: boolean, inputArray: Array<any>) {
  if (isChecked) {
    this.checkboxInputArray = [{ input: inputArray, isChecked: isChecked }]

  } else {
    this.checkboxInputArray = [{ input: inputArray, isChecked: isChecked }]
  }
 
  this.valueChange.emit(this.checkboxInputArray[0]);
}

}

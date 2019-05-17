import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'lib-gov-checkbox',
  templateUrl: './gov-uk-checkbox.component.html',
})
export class GovUkCheckboxComponent implements OnInit {
  constructor () { }

  @Output() valueChange = new EventEmitter();
  emails: Array<any>;

  @Input() id: string
  @Input() test: Array<any>

  ngOnInit(): void {

  }

onInputChange(checkedId: string, isChecked: boolean, test: Array<any>) {
console.log('test is',test)
  if (isChecked) {
    this.emails = [{ test: test, isChecked: isChecked }]

  } else {
    this.emails = [{ test: test, isChecked: isChecked }]
  }
 
  this.valueChange.emit(this.emails[0]);
}

}

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

  ngOnInit(): void {

  }

onInputChange(checkedId: string, isChecked: boolean) {

  if (isChecked) {
    this.emails = [{ id: checkedId, isChecked: isChecked }]

  } else {
    this.emails = [{ id: checkedId, isChecked: isChecked }]
  }
 
  this.valueChange.emit(this.emails[0]);
}

}

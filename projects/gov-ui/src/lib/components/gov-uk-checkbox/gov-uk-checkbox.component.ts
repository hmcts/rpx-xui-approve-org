import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
/*
* Gov Uk Checkbox Dumb Component responsible for
* displaying checkbox input and hint
*
* */
@Component({
  selector: 'lib-gov-checkbox',
  templateUrl: './gov-uk-checkbox.component.html',
  /*template: `
      <div class="govuk-checkboxes__item" [formGroup]="group">
        <input class="govuk-checkboxes__input" type="checkbox" [attr.aria-describedby]="config.value+'-item-hint'"
        [id]="config.id" [name]="config.name" [formControlName]="config.value">
        <lib-gov-label appRemoveHost [config]="config"></lib-gov-label>
        <span [id]="config.value+'-hint'" class="govuk-hint govuk-checkboxes__hint">
          {{config.hint}}
        </span>
      </div>
  `*/
  /*template: '<div class="govuk-checkboxes__item"> <input class ="govuk-checkboxes__input" id="pending1"' +
  'name="pending" type="checkbox" value (change)="checkChanged($event.target.checked)"' +
  '[checked]="displayCode">' + '<label class="govuk-label govuk-checkboxes__label"' +
  'for="pending1"></label>' + '</div>'*/

})
export class GovUkCheckboxComponent implements OnInit {
  constructor (private fb: FormBuilder) { }
  @Input() group: FormGroup;
  @Input() config: {value: string, label: string, hint: string; name: string; focusOn: string; id: string; classes: string};
  @Input() displayCode: boolean;
  @Output() valueChange = new EventEmitter();
  counter = 0;    
  myForm: FormGroup;
  emails: Array<any>;

  @Input() id: string
/**
* ngOnInIt
 * needed to manage the focus id if passed on in config
 * si it can focus on element when user clicks on error message in the header.
* */
  ngOnInit(): void {
    //const id =  this.config.focusOn ? this.config.focusOn : this.config.value;
    //this.config.id = id;
    //this.config.classes = this.config.classes ?
    //  this.config.classes.concat(' govuk-checkboxes__label') : 'govuk-checkboxes__label';
    this.myForm = this.fb.group({
      pendingorgs: this.fb.array([])
    });
  }

  valueChanged() { // You can give any function name
    this.counter = this.counter + 1;
    this.valueChange.emit(this.counter);
}


onChange(pendingorg: string, isChecked: boolean) {
  const pendingOrgFormArray = <FormArray>this.myForm.controls.pendingorgs;
  this.emails = [{ pendingArray: pendingOrgFormArray, isChecked: isChecked }]

  if (isChecked) {
    pendingOrgFormArray.push(new FormControl(pendingorg));
  } else {
    let index = pendingOrgFormArray.controls.findIndex(x => x.value == pendingorg)
    pendingOrgFormArray.removeAt(index);
  }
  if(isChecked)
  {
    //newArray
  }
  console.log('forms in checkbox',pendingOrgFormArray)
  console.log('new array',this.emails[0].isChecked)
  console.log('forms',this.emails[0].pendingArray)
  this.valueChange.emit(this.emails[0]);
}

}

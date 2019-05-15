import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';
/*
* Gov Uk Checkbox Dumb Component responsible for
* displaying checkbox input and hint
*
* */
@Component({
  selector: 'lib-gov-checkbox',
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
    template: '<button (click)="valueChanged()">Click me</button>'
})
export class GovUkCheckboxComponent implements OnInit {
  constructor () { }
  @Input() group: FormGroup;
  @Input() config: {value: string, label: string, hint: string; name: string; focusOn: string; id: string; classes: string};
  @Input() displayCode: boolean;
  @Output() valueChange = new EventEmitter();
  counter = 0;

  id: string;
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
  }

  valueChanged() { // You can give any function name
    this.counter = this.counter + 1;
    this.valueChange.emit(this.counter);
}

}

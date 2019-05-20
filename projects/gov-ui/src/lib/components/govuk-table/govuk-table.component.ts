import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
    selector: 'lib-govuk-table',
    templateUrl: './govuk-table.component.html',
    styleUrls: ['./govuk-table.component.scss']
})
export class GovukTableComponent implements OnInit{

    @Input() classes = '';
    @Input() caption = 'Dates and amounts';
    @Input() firstCellIsHeader = true;
    @Output() valueChange = new EventEmitter();
    inputForm: FormGroup;

    @Input() rows;

    @Input() columnConfig: GovukTableColumnConfig[];

    constructor(private fb: FormBuilder) { }
    ngOnInit(): void {
    this.inputForm = this.fb.group({
      checkedInput: this.fb.array([])
    });
  }

processCheckboxInput(checkboxInputArray) {
  const formArray = <FormArray>this.inputForm.controls.checkedInput;

  if (checkboxInputArray.isChecked) {
    formArray.push(new FormControl(checkboxInputArray.input));
  } else {
    let index = formArray.controls.findIndex(x => x.value == checkboxInputArray.input)
    formArray.removeAt(index);
  }
  this.valueChange.emit(formArray);
}

}

export class GovukTableColumnConfig {
    header: string;
    key: string;
    type?: string;
    class?: string;
    multiColumnMapping?: string;
    constructor() {}

  }

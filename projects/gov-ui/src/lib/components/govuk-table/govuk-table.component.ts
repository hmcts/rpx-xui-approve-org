import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { MOCKDATAMAPPINGS } from '../govuk-table/mock-data-mappings';
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
    counter = 0;
    myForm: FormGroup;
    isChecked: boolean;

    @Input() rows;

    @Input() columnConfig: GovukTableColumnConfig[] = [
        { header: MOCKDATAMAPPINGS[0].header, key: MOCKDATAMAPPINGS[0].key, type: MOCKDATAMAPPINGS[0].type },
        { header: MOCKDATAMAPPINGS[1].header, key: MOCKDATAMAPPINGS[1].key },
        { header: MOCKDATAMAPPINGS[2].header, key: MOCKDATAMAPPINGS[2].key, class: MOCKDATAMAPPINGS[2].class },
        { header: MOCKDATAMAPPINGS[3].header, key: MOCKDATAMAPPINGS[3].key, type: MOCKDATAMAPPINGS[3].type,
         multiColumnMapping: MOCKDATAMAPPINGS[3].multiColumnMapping }
    ];

    constructor(private fb: FormBuilder) { }
    ngOnInit(): void {
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

  if (isChecked) {
    pendingOrgFormArray.push(new FormControl(pendingorg));
  } else {
    let index = pendingOrgFormArray.controls.findIndex(x => x.value == pendingorg)
    pendingOrgFormArray.removeAt(index);
  }
  //console.log('forms',pendingOrgFormArray)
  this.valueChange.emit(pendingOrgFormArray);
}
displayCounter(count) {
  console.log('test',count.value);
}
displayCounterButton(count, isChecked: boolean) {
  this.isChecked = true;
  console.log('test button id is ',count.value);
  const pendingOrgFormArray = <FormArray>this.myForm.controls.pendingorgs;

  if (this.isChecked) {
    pendingOrgFormArray.push(new FormControl(count));
  } else {
    let index = pendingOrgFormArray.controls.findIndex(x => x.value == count)
    pendingOrgFormArray.removeAt(index);
  }
  //console.log('forms',pendingOrgFormArray)
  this.valueChange.emit(pendingOrgFormArray);
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

import {Component, Input, Output, EventEmitter} from '@angular/core';
import { MOCKDATAMAPPINGS } from '../govuk-table/mock-data-mappings';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
    selector: 'lib-govuk-table',
    templateUrl: './govuk-table.component.html',
    styleUrls: ['./govuk-table.component.scss']
})
export class GovukTableComponent {

    @Input() classes = '';
    @Input() caption = 'Dates and amounts';
    @Input() firstCellIsHeader = true;
    @Output() valueChange = new EventEmitter();
    counter = 0;
    displayCode: boolean;
    isFoo:boolean = false;
    myForm: FormGroup;
    

    @Input() rows;

    @Input() columnConfig: GovukTableColumnConfig[] = [
        { header: MOCKDATAMAPPINGS[0].header, key: MOCKDATAMAPPINGS[0].key, type: MOCKDATAMAPPINGS[0].type },
        { header: MOCKDATAMAPPINGS[1].header, key: MOCKDATAMAPPINGS[1].key },
        { header: MOCKDATAMAPPINGS[2].header, key: MOCKDATAMAPPINGS[2].key, class: MOCKDATAMAPPINGS[2].class },
        { header: MOCKDATAMAPPINGS[3].header, key: MOCKDATAMAPPINGS[3].key, type: MOCKDATAMAPPINGS[3].type,
         multiColumnMapping: MOCKDATAMAPPINGS[3].multiColumnMapping }
    ];

    constructor(private fb: FormBuilder) { }

    valueChanged(value: boolean,key:string) { // You can give any function name
        console.log('key',key)
        this.valueChange.emit(value);
    }

    onChange(email: string, isChecked: boolean,) {
        const emailFormArray = <FormArray>this.myForm.controls.useremail;
    
        if (isChecked) {
          emailFormArray.push(new FormControl(email));
        } else {
          let index = emailFormArray.controls.findIndex(x => x.value == email)
          emailFormArray.removeAt(index);
        }
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

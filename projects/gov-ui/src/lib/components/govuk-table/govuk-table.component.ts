import {Component, Input} from '@angular/core';
import { MOCKDATAMAPPINGS } from '../govuk-table/mock-data-mappings'

@Component({
    selector: 'app-govuk-table',
    templateUrl: './govuk-table.component.html',
    styleUrls: ['./govuk-table.component.scss']
})
export class GovukTableComponent {

    @Input() classes = '';
    @Input() caption = 'Dates and amounts';
    @Input() firstCellIsHeader = true;

    @Input() rows;

    @Input() columnConfig: GovukTableColumnConfig[] = [
        { header: MOCKDATAMAPPINGS[0].header, key: MOCKDATAMAPPINGS[0].key, type: MOCKDATAMAPPINGS[0].type },
        { header: MOCKDATAMAPPINGS[1].header, key: MOCKDATAMAPPINGS[1].key },
        { header: MOCKDATAMAPPINGS[2].header, key: MOCKDATAMAPPINGS[2].key, class:MOCKDATAMAPPINGS[2].class },
        { header: MOCKDATAMAPPINGS[3].header, key: MOCKDATAMAPPINGS[3].key, type: MOCKDATAMAPPINGS[3].type, multiColumnMapping:MOCKDATAMAPPINGS[3].multiColumnMapping }
    ];

    constructor() { }

}

export class GovukTableColumnConfig {
    header: string;
    key: string;
    type?: string;
    class?: string;
    multiColumnMapping?:string;
    constructor() {
        this.header = '';
        this.key = '';
        this.type = 'text';
        this.class= '';
        this.multiColumnMapping  = '';
    }
  }

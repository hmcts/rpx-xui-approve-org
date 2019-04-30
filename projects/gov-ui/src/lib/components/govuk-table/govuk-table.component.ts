import {Component, Input} from '@angular/core';

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
        { header: 'Date', key: 'date', type: 'text' },
        { header: 'Amount', key: 'amount' },
        { header: 'Amount', key: 'amount', class:'hmcts-class' },
        { header: 'Amount', key: 'amount', id:'12345' }
    ];

    constructor() { }

}

export class GovukTableColumnConfig {
    header: string;
    key: string;
    type?: string;
    class?: string;
    id?:string;
    constructor() {
        this.header = '';
        this.key = '';
        this.type = 'text';
        this.class= '';
        this.id  = '';
    }
  }

import {Component, OnInit, Input} from '@angular/core';
import {SingleOrgSummary} from '../../models/single-org-summary';

/**
 * Bootstraps the Summary Components
 */

@Component({
  selector: 'app-prd-summary-component',
  templateUrl: './summary.component.html',
})
export class SummaryComponent implements OnInit {

  @Input() data: SingleOrgSummary;

  constructor() {}

  ngOnInit(): void {
  }

}

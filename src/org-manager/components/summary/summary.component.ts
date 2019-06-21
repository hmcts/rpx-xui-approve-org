import {Component, OnInit, Input} from '@angular/core';
import {SingleOrgSummary} from '../../models/single-org-summary';

/**
 * Bootstraps the Summary Components
 */

@Component({
  selector: 'app-prd-summary-component',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  @Input() data: SingleOrgSummary;

  constructor() {}

  ngOnInit(): void {
  }

}

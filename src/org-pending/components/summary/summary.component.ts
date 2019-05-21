import { Input, Component, OnInit } from "@angular/core";
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary'

/**
 * Bootstraps the Summary Components
 */

@Component({
  selector: 'app-org-summary-component',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  @Input() data: SingleOrgSummary;

  constructor() {}

  ngOnInit(): void {
  }

}

import { Input, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-org-summary-component',
  templateUrl: './summary-pending.component.html',
  styleUrls: ['./summary-pending.component.scss']
})
export class SummaryPendingComponent {

  @Input() data;

  constructor() {}

}

import { Input, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-org-summary-component',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {

  @Input() data;

  constructor() {}

}

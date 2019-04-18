import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisationStore from '../../../org-manager/store';
import { GovukTableColumnConfig } from 'projects/gov-ui/src/lib/components/govuk-table/govuk-table.component';
import {Observable} from 'rxjs';
@Component({
  selector: 'app-prd-org-overview-pending-component',
  templateUrl: './org-overview.component.html',
})

export class NotificationBannerComponent implements OnInit{
  
  constructor() {}

  ngOnInit(): void {

  }

}

import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
  providers: [PendingOrganisationService]
})

export class PendingOverviewComponent implements OnInit{

  pendingOrgs: PendingOrganisation[];


  constructor(private store: Store<any>,private pendingOrganisationService: PendingOrganisationService) {}

  ngOnInit(): void {
    
    this.pendingOrganisationService.fetchPendingOrganisations().subscribe(
      (pendingOrgs: PendingOrganisation[]) => this.pendingOrgs= pendingOrgs
    );

    console.log('printing orgs')
    console.log(this.pendingOrgs);

  }

}


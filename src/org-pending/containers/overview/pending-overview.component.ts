import {Component, OnInit} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
import { subscribeOn } from 'rxjs/operators';
@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-overview.component.html',
  providers: [PendingOrganisationService]
})

export class PendingOverviewComponent implements OnInit{

  pendingOrgs: PendingOrganisation[];
  displayCode: boolean;


  constructor(private store: Store<any>,private pendingOrganisationService: PendingOrganisationService) {}

  ngOnInit(): void {
    this.pendingOrganisationService.fetchPendingOrganisations().subscribe(
      (pendingOrgs: PendingOrganisation[]) => this.pendingOrgs= pendingOrgs
    );

    console.log('printing orgs')
    console.log(this.pendingOrgs);

   this.store.pipe(select('org-pending')).subscribe(
      pendingOrgs => {
      if(pendingOrgs) {
        this.displayCode = pendingOrgs.showPendingOrg;
      }
      });

      this.store.dispatch({
        type: 'SHOW_PENDING_ORG',
        payload: true
      })


  }

  checkChanged(value: boolean): void {
    this.store.dispatch({
      type: 'SHOW_PENDING_ORG',
      payload: value
    })
  }

}


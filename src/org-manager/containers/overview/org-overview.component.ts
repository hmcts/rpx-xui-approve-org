import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { Observable } from 'rxjs';
import { OrganisationVM } from '../../models/organisation';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './org-overview.component.html',
})

export class OverviewComponent implements OnInit {
  orgs$: Observable<any>;
  loading$: Observable<boolean>;
  pendingOrgsCount$: Observable<number>;

  constructor(
    private store: Store<fromOrganisation.OrganisationState>,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(new fromOrganisation.LoadOrganisation());
    this.orgs$ = this.store.pipe(select(fromOrganisation.getActiveOrganisation));
    // this.loading$ = this.store.pipe(select(fromOrganisation.organisationsLoading));
    //
    // this.pendingStore.dispatch(new fromOrganisationPendingStore.LoadPendingOrganisations());
    // this.pendingOrgsCount$ = this.pendingStore.pipe(select(fromOrganisationPendingStore.pendingOrganisationsCount));

  }
}

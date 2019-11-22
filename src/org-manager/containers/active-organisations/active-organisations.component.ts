import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { Observable } from 'rxjs';
import {takeWhile} from 'rxjs/operators';


@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './active-organisations.component.html',
})

export class ActiveOrganisationsComponent implements OnInit {
  orgs$: Observable<any>;
  loading$: Observable<boolean>;
  pendingLoading$: Observable<boolean>;
  pendingOrgsCount$: Observable<number>;

  constructor(
    private store: Store<fromOrganisation.OrganisationRootState>,
  ) { }

  ngOnInit(): void {
    this.store.pipe(select(
      fromOrganisation.getActiveLoaded),
      takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
      }
    });

    this.pendingLoading$ = this.store.pipe(select(fromOrganisation.getPendingLoaded));
    this.pendingLoading$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });


    this.orgs$ = this.store.pipe(select(fromOrganisation.getActiveOrganisationArray));
    this.loading$ = this.store.pipe(select(fromOrganisation.getActiveLoading));
    this.pendingOrgsCount$ = this.store.pipe(select(fromOrganisation.pendingOrganisationsCount));

  }
}

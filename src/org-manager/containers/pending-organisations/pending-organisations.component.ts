import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Action, MemoizedSelector, Store } from '@ngrx/store';

import { OrganisationVM } from '../../models/organisation';
import * as fromStore from '../../store';
import { OrganisationListComponent } from './../organisation-list/organisation-list.component';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
  styleUrls: [ '../organisation-list/organisation-list.component.scss' ]
})
export class PendingOrganisationsComponent extends OrganisationListComponent {
  public get loadedSelector(): MemoizedSelector<object, boolean> {
    return fromStore.getPendingLoaded;
  }
  public get loadAction(): Action {
    return new fromStore.LoadPendingOrganisations();
  }
  public get organisationsSelector(): MemoizedSelector<object, OrganisationVM[]> {
    return fromStore.getPendingOrganisationsArray;
  }

  constructor(protected readonly store: Store<fromStore.OrganisationRootState>, protected readonly route: ActivatedRoute) {
    super(store, route);
  }
}

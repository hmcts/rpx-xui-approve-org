import { Component } from '@angular/core';
import { Action, MemoizedSelector, Store } from '@ngrx/store';

import * as fromStore from '../../../org-manager/store';
import { OrganisationVM } from '../../models/organisation';
import * as fromOrganisation from '../../store/';
import { OrganisationListComponent } from './../organisation-list/organisation-list.component';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
})
export class PendingOrganisationsComponent extends OrganisationListComponent {
  public get loadedSelector(): MemoizedSelector<object, boolean> {
    console.log('Pending.loadedSelector getter');
    return fromOrganisation.getPendingLoaded;
  }
  public get loadAction(): Action {
    return new fromOrganisation.LoadPendingOrganisations();
  }
  public get organisationsSelector(): MemoizedSelector<object, OrganisationVM[]> {
    return fromStore.getPendingOrganisationsArray;
  }

  constructor(protected readonly store: Store<fromStore.OrganisationRootState>) {
    super(store);
  }
}

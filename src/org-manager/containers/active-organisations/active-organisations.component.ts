import { Component } from '@angular/core';
import { Action, MemoizedSelector, Store } from '@ngrx/store';

import * as fromStore from '../../../org-manager/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationListComponent } from './../organisation-list/organisation-list.component';

/**
 * Bootstraps Active Organisations
 */
@Component({
  selector: 'app-prd-org-overview-component',
  templateUrl: './active-organisations.component.html',
})

export class ActiveOrganisationsComponent extends OrganisationListComponent {
  public get loadedSelector(): MemoizedSelector<object, boolean> {
    return fromOrganisation.getActiveLoaded;
  }
  public get loadAction(): Action {
    return new fromOrganisation.LoadActiveOrganisation();
  }
  public get organisationsSelector(): MemoizedSelector<object, OrganisationVM[]> {
    return fromStore.getActiveOrganisationArray;
  }

  constructor(protected readonly store: Store<fromOrganisation.OrganisationRootState>) {
    super(store);
  }
}

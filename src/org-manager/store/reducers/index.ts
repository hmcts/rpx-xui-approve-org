import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';
import * as fromSingleOrg from './single-org.reducer';


export interface OrganisationState {
  organisations: fromOrganisations.OrganisationState;
  singleOrg: fromSingleOrg.SingleOrgState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  organisations: fromOrganisations.reducer,
  singleOrg: fromSingleOrg.reducer,
};

export const getRootOrganisationsState = createFeatureSelector<OrganisationState>(
  'organisations'
);

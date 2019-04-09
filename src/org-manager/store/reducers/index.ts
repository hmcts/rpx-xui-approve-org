import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';


export interface OrganisationState {
  organisations: fromOrganisations.OrganisationState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  organisations: fromOrganisations.reducer,
};

export const getRootOrganisationsState = createFeatureSelector<OrganisationState>(
  'organisations'
);

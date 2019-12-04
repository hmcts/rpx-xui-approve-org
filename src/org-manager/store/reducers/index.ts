import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './organisation.reducer';

export interface OrganisationRootState {
  organisations: fromPendingOrganisations.OrganisationState;
}

export const reducers: ActionReducerMap<OrganisationRootState> = {
  organisations: fromPendingOrganisations.reducer,
};

export const getRootApproveOrgState = createFeatureSelector<OrganisationRootState>(
  'orgStatePending'
);

export * from './organisation.reducer';

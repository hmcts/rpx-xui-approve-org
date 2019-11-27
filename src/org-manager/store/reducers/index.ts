import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './organisation.reducer';
import * as fromEditOrganisation from './edit-details.reducer';

export interface OrganisationRootState {
  organisations: fromPendingOrganisations.OrganisationState;
  editDetails: fromEditOrganisation.EditDetailsState
}

export const reducers: ActionReducerMap<OrganisationRootState> = {
  organisations: fromPendingOrganisations.reducer,
  editDetails: fromEditOrganisation.reducer
};

export const getRootApproveOrgState = createFeatureSelector<OrganisationRootState>(
  'orgState'
);

export * from './organisation.reducer';

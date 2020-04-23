import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromEditOrganisation from './edit-details.reducer';
import * as fromPendingOrganisations from './organisation.reducer';
import * as fromUsersReducer from './users.reducer';

export interface OrganisationRootState {
  organisations: fromPendingOrganisations.OrganisationState;
  editDetails: fromEditOrganisation.EditDetailsState;
  users: fromUsersReducer.UsersState;
}

export const reducers: ActionReducerMap<OrganisationRootState> = {
  organisations: fromPendingOrganisations.reducer,
  editDetails: fromEditOrganisation.reducer,
  users: fromUsersReducer.reducer
};

export const getRootApproveOrgState = createFeatureSelector<OrganisationRootState>(
  'orgState'
);

export * from './organisation.reducer';

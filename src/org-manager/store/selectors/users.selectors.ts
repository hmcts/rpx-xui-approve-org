import {createSelector} from '@ngrx/store';
import * as fromOrganisation from '../reducers';
import * as fromUsers from '../reducers/users.reducer';

export const getUsersState = createSelector(
  fromOrganisation.getRootApproveOrgState,
  (state: fromOrganisation.OrganisationRootState) => state.users
);

export const getPendingUserSelector = createSelector(
  getUsersState,
  fromUsers.getPendingUser
);

export const getUsersOrganisationIdSelector = createSelector(
  getUsersState,
  fromUsers.getOrganisationId
);



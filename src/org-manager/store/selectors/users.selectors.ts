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

export const getInviteUserErrorMessageSelector = createSelector(
  getUsersState,
  fromUsers.getInviteUserErrorMessage
);

export const getInviteUserIsFormValidSelector = createSelector(
  getUsersState,
  fromUsers.getInviteUserIsFormValid
);

export const getInviteUserErrorHeaderSelector = createSelector(
  getUsersState,
  fromUsers.getInviteUserErrorHeader
);


export const getGetInviteUserErrorsArray = createSelector(
  getInviteUserErrorMessageSelector,
  getInviteUserIsFormValidSelector,
  getInviteUserErrorHeaderSelector,
  (obj, isFormValid, header) => {
    const items = Object.keys(obj).map(key => {
      if (key) {
        return {
          id: key,
          message: obj[key].messages.filter((el) => el !== '')
        };
      }
    });

    return {
      isFromValid: isFormValid,
      header,
      items
    };
  }
);


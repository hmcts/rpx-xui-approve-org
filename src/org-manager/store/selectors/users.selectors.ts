import {createSelector} from '@ngrx/store';
import * as fromOrganisation from '../reducers';
import * as fromUsers from '../reducers/users.reducer';

export const getUsersState = createSelector(
  fromOrganisation.getRootApproveOrgState,
  (state: fromOrganisation.OrganisationRootState) => state.users
);

export const getSelectedUserSelector = createSelector(
  getUsersState,
  fromUsers.getSelectedUser
);

export const getOrganisationIdSelector = createSelector(
  getUsersState,
  fromUsers.getOrganisationId
);

export const getIsSuperUserSelector = createSelector(
  getUsersState,
  fromUsers.getIsSuperUser
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


export const getInviteSuccessEmailSelector = createSelector(
  getUsersState,
  fromUsers.getInviteSuccessEmail
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


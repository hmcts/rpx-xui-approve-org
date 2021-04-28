import { User } from '@hmcts/rpx-xui-common-lib';
import { AppConstants } from 'src/app/app.constants';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromActions from '../actions/users.actions';

export interface UsersState {
  selectedUser: User;
  isSuperUser: boolean;
  selectedOrg: OrganisationVM;
  organisationId: string;
  isFormValid: boolean;
  errorHeader: string;
  errorMessages: object;
  reinviteSuccessEmail: string;
}

export const initialState: UsersState = {
  selectedUser: null,
  isSuperUser: false,
  selectedOrg: null,
  organisationId: null,
  errorHeader: null,
  errorMessages: {},
  isFormValid: false,
  reinviteSuccessEmail: null
};

export function reducer(
  state = initialState,
  action: fromActions.UsersAction
): UsersState {
  switch (action.type) {

    case fromActions.SHOW_USER_DETAILS: {
      return {
        ...initialState,
        selectedUser: action.payload.userDetails,
        organisationId: action.payload.orgId,
        isSuperUser: action.payload.isSuperUser
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_SUCCESS: {
      return {
        ...state,
        reinviteSuccessEmail: action.payload.successEmail
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_ERROR: {
      const errorMessages = {
        serverResponse: {
          messages: [
            action.payload.error.apiStatusCode === 409 && AppConstants.ERROR_MESSAGE_MAPPINGS ? AppConstants.ERROR_MESSAGE_MAPPINGS[1] :  action.payload.error.message
          ]
        }
      };
      return {
        ...state,
        errorMessages,
        isFormValid: false,
        reinviteSuccessEmail: null,
        errorHeader: 'Sorry, there is a problem with the service.'
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_ERROR_CODE_429: {
      const errorMessages = {
        serverResponse1: {
          messages: ['This user has already been invited in the last hour']
        },
        serverResponse2: {
          messages: ['The recipient will receive an email from HM Courts and Tribunals Registrations so they can finish setting up their account']
        }
      };
      return {
        ...state,
        isFormValid: false,
        errorHeader: '',
        reinviteSuccessEmail: null,
        errorMessages,
      };
    }

    case fromActions.UPDATE_ERROR_MESSAGES: {
      const errorMessagesPayload = action.payload.errorMessages;
      const formErrorIsInvalid = action.payload.isInvalid;

      const errorMessages = Object.keys(formErrorIsInvalid).reduce((acc, key) => {

        const objArr = (k): any[] => {
          return formErrorIsInvalid[k].map((item, i) => {
              return item ? errorMessagesPayload[k][i] : '';
          });
        };

        const isInvalid = objArr(key).filter(item => item.length);

        acc[key] = {
          messages: objArr(key),
          isInvalid: !!isInvalid.length
        };

        return acc;

        }, {});
      const isFormValid = !Object.keys(errorMessages)
        .filter(key => errorMessages[key].isInvalid).length;

      return {
        ...state,
        errorMessages,
        isFormValid,
        errorHeader: 'There is a problem'
      };
    }

    default:
      return state;
  }
}

export const getSelectedUser = (state: UsersState) => state.selectedUser;
export const getSelectedOrganisation = (state: UsersState) => state.selectedOrg;
export const getIsSuperUser = (state: UsersState) => state.isSuperUser;
export const getOrganisationId = (state: UsersState) => state.organisationId;
export const getInviteUserErrorMessage = (state: UsersState) => state.errorMessages;
export const getInviteUserIsFormValid = (state: UsersState) => state.isFormValid;
export const getInviteUserErrorHeader = (state: UsersState) => state.errorHeader;
export const getInviteSuccessEmail = (state: UsersState) => state.reinviteSuccessEmail;

import { User } from '@hmcts/rpx-xui-common-lib';
import { AppConstants } from 'src/app/app.constants';
import * as fromActions from '../actions/users.actions';

export interface UsersState {
  errorHeader: string;
  errorMessages: object;
  pendingUser: User;
  organisationId: string;
  successUserEmail: string;
  isFormValid: boolean;

}

export const initialState: UsersState = {
  pendingUser: null,
  organisationId: null,
  successUserEmail: null,
  errorHeader: null,
  errorMessages: {},
  isFormValid: false
};

export function reducer(
  state = initialState,
  action: fromActions.UsersAction
): UsersState {
  switch (action.type) {
    case fromActions.REINVITE_PENDING_USER: {
      console.log('coming to reducer:');
      console.log(action.payload);
      return {
        ...state,
        pendingUser: action.payload.pendingUser,
        organisationId: action.payload.organisationId
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_SUCCESS: {
      console.log('submit success response: ');
      console.log(action.payload);
      return {
        ...state
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_ERROR: {
      console.log('submit error response: ');
      console.log(action.payload);
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
        errorHeader: 'Sorry, there is a problem with the service.'
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

export const getPendingUser = (state: UsersState) => state.pendingUser;
export const getOrganisationId = (state: UsersState) => state.organisationId;
export const getInviteUserErrorMessage = (state: UsersState) => state.errorMessages;
export const getInviteUserIsFormValid = (state: UsersState) => state.isFormValid;
export const getInviteUserErrorHeader = (state: UsersState) => state.errorHeader;


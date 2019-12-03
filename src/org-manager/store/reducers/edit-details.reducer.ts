import * as fromActions from '../actions/edit-details.actions';
import {OrgManagerConstants} from '../../org-manager.constants';

export interface EditDetailsState {
  pba: {
    errorMessages: {[id: string]: {isInvalid: boolean; messages: string[]}}
    isFormValid: boolean;
    serverError: {type: string; message: string}
  };
}

export const initialState: EditDetailsState = {
  pba: {
    errorMessages: {},
    isFormValid: true,
    serverError: null
  }
};

export function reducer(
  state = initialState,
  action: fromActions.EditDetailsActions
): EditDetailsState {
  switch (action.type) {
    case fromActions.DISPATCH_SAVE_PBA_VALIDATION: {
      const {isInvalid, errorMsg} = action.payload;

      const errorMessages = Object.keys(isInvalid).reduce((acc, key) => {
        const hasErrors = isInvalid[key].filter((item) => item !== null).length;
        if (hasErrors) {
            acc[key] = {
              messages: [errorMsg[0]],
              isInvalid: !!hasErrors
            };
            return acc;
        } else { return acc; }
      }, {});
      const isFormValid = !Object.keys(errorMessages).filter(key => errorMessages[key].isInvalid).length;
      const pba =  {
        ...state.pba,
        errorMessages,
        isFormValid
      };

      return {
        ...state,
        pba
      };
    }

    case fromActions.SUBMIT_PBA_SUCCESS: {
      const pba = {
        ...state.pba,
        serverError: null
      };

      return {
        ...state,
        pba
      };
    }

    case fromActions.CLEAR_PBA_ERRORS: {
      const pba = {
        ...state.pba,
        errorMessages: {},
        isFormValid: true
      };

      return {
        ...state,
        pba
      };
    }

    case fromActions.SUBMIT_PBA_FAILURE : {
      const status = action.payload['status'];
      const isServerError = OrgManagerConstants.STATUS_CODES.serverErrors.includes(status);

      if (isServerError) {
        const serverError = {
          type: 'warning',
          message: OrgManagerConstants.PBA_SERVER_ERROR_MESSAGE
        };

        const newPba = {
          ...state.pba,
          serverError
        };

        return {
          ...state,
          pba: newPba
        };
      }

      const id = {
          messages: (action.payload)['error'].apiError,
          isFormValid: false
      };
      const errorMessages = {
        ...state.pba.errorMessages,
        id
      };
      const pba = {
        ...state.pba.errorMessages,
        errorMessages
      } as any; // todo revisit why this any

      return {
        ...state,
        pba
      };
    }
  }
  return state;
}

export const getPbaIsFormValid = (state: EditDetailsState) => state.pba.isFormValid;
export const getPbaServerError = (state: EditDetailsState) => state.pba.serverError;

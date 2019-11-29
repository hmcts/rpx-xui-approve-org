import * as fromActions from '../actions/edit-details.actions';

export interface EditDetailsState {
  pba: {
    errorMessages: {[id: string]: {isInvalid: boolean; messages: string[]}}
    isFormValid: boolean;
  };
}

export const initialState: EditDetailsState = {
  pba: {
    errorMessages: {},
    isFormValid: true
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
            }
            return acc;
        } else {return acc}
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

    case fromActions.SUBMIT_PBA_FAILURE : {
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
      } as any; // todo revisity why this any
      return {
        ...state,
        pba
      };

    }
  }
  return state;
}

export const getInviteUserData = (state: EditDetailsState) => state.pba;
export const getPbaIsFormValid = (state: EditDetailsState) => state.pba.isFormValid;

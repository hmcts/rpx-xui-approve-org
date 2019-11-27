import * as fromActions from '../actions/edit-details.actions';

export interface EditDetailsState {
  pba: {
    errorMessages: {[id: string]: string}
    isFromValid: boolean;
  };
}
export const initialState: EditDetailsState = {
  pba: {
    errorMessages: {},
    isFromValid: false
  }
};

export function reducer(
  state = initialState,
  action: fromActions.EditDetailsActions
): EditDetailsState {
  switch (action.type) {
    case fromActions.DISPATCH_SUBMIT_VALIDATION: {
      const {isInvalid, errorMsg} = action.payload;

      const errorMessages = Object.keys(isInvalid).reduce((acc, key) => {
        const hasErrors = isInvalid[key].filter((item) => item !== null).length;
        if (hasErrors) {
          return {
            ...acc,
            [key]: errorMsg[0]
          };
        } else {return {...acc}}
      }, {});

      const pba =  {
        ...state.pba,
        errorMessages
      };

      return {
        ...state,
        pba
      };
    }
  }
  return state;
}

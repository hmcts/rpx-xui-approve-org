import * as fromAction from '../actions';
import {AppUtils} from '../../utils/app-utils';


export interface ErrorMessage {
  bodyText: string;
  urlText: string;
  url: string;
}

export interface GlobalError {
  header: string;
  errors: ErrorMessage [];
}

export interface AppState {
  pageTitle: string;
  globalError: GlobalError;
}

export const initialState: AppState = {
  pageTitle: '',
  globalError: null
};

export function reducer(
  state = initialState,
  action: fromAction.appActions
): AppState {
  switch (action.type) {
    case fromAction.SET_PAGE_TITLE: {
      const pageTitle = AppUtils.setPageTitle(action.payload);
      return {
        ...state,
        pageTitle
      };
    }

    case fromAction.SET_PAGE_TITLE_ERRORS: {
      const pageTitle = 'Error: ' + state.pageTitle;
      return {
        ...state,
        pageTitle
      };
    }

    case fromAction.LOGOUT: {
      return {
        ...state,
        ...initialState
      };
    }

    case fromAction.APP_ADD_GLOBAL_ERROR: {
      return {
        ...state,
        globalError: action.payload
      };
    }

    case fromAction.APP_CLEAR_GLOBAL_ERROR: {
      return {
        ...state,
        globalError: null
      };
    }

    default:
      return state;
  }
}

export const getPageTitle = (state: AppState) => state.pageTitle;
export const getGlobalError = (state: AppState) => state.globalError;




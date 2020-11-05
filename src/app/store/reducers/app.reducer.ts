import { UserModel } from '../../../models/user.model';
import {AppUtils} from '../../utils/app-utils';
import * as fromAction from '../actions';


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
  userDetails: UserModel | null;
  modal: {[id: string]: {isVisible?: boolean; countdown?: string}};
  loaded: boolean;
  loading: boolean;
  globalError: GlobalError;
}

export const initialState: AppState = {
  pageTitle: '',
  userDetails: null,
  modal: {
    session: {
      isVisible: false,
      countdown: ''
    }
  },
  loaded: false,
  loading: false,
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
      const pageTitle = `Error: ${state.pageTitle}`;
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
    case fromAction.GET_USER_DETAILS_SUCCESS: {
      const userDetails = new UserModel(action.payload);
      return {
        ...state,
        userDetails,
        loaded: true,
        loading: false,
      };
    }
    case fromAction.SET_MODAL: {
      return {
        ...state,
        modal: {...action.payload}
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
export const getUserDetails = (state: AppState) => state.userDetails;
export const getModal = (state: AppState) => state.modal;
export const getGlobalError = (state: AppState) => state.globalError;

import { UserModel } from '../../../models/user.model';
import * as fromAction from '../actions';

export interface AppFeatureFlag {
  featureName: string;
  isEnabled: boolean;
}

export interface ErrorMessage {
  bodyText: string;
  urlText: string;
  url: string;
}

export interface GlobalError {
  header: string;
  errors: ErrorMessage[];
}

export interface AppState {
  pageTitle: string;
  userDetails: UserModel | null;
  modal: { [id: string]: { isVisible?: boolean; countdown?: string } };
  loaded: boolean;
  loading: boolean;
  globalError: GlobalError;
  featureFlags: AppFeatureFlag[];
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
  globalError: null,
  featureFlags: []
};

export function reducer(
  state = initialState,
  action: fromAction.appActions
): AppState {
  switch (action.type) {
    case fromAction.LOGOUT: {
      return {
        ...state,
        ...initialState
      };
    }
    case fromAction.LOAD_FEATURE_TOGGLE_CONFIG_SUCCESS:
      return {
        ...state,
        featureFlags: action.payload
      };
    case fromAction.GET_USER_DETAILS_SUCCESS: {
      const userDetails = new UserModel(action.payload);
      return {
        ...state,
        userDetails,
        loaded: true,
        loading: false
      };
    }
    case fromAction.SET_MODAL: {
      return {
        ...state,
        modal: { ...action.payload }
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
export const getFeatureFlag = (state: AppState) => state.featureFlags;

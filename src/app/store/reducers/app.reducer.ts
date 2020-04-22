import { UserModel } from '../../../models/user.model';
import {AppUtils} from '../../utils/app-utils';
import * as fromAction from '../actions';

export interface AppState {
  pageTitle: string;
  userDetails: UserModel | null;
  modal: {[id: string]: {isVisible?: boolean; countdown?: string}};
  loaded: boolean;
  loading: boolean;
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
  loading: false
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
    default: {
      return {
        ...state
      };
    }
  }

  return state;
}

export const getPageTitle = (state: AppState) => state.pageTitle;
export const getUserDetails = (state: AppState) => state.userDetails;
export const getModal = (state: AppState) => state.modal;

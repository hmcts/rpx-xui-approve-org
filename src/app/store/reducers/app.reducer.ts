import * as fromAction from '../actions';
import {AppUtils} from '../../utils/app-utils';

export interface AppState {
  pageTitle: string;
}

export const initialState: AppState = {
  pageTitle: ''
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
  }

  return state;
}

export const getPageTitle = (state: AppState) => state.pageTitle;



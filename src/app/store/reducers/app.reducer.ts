import { AppUtils } from '../../utils/app-utils';
import * as fromAction from '../actions';

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
  let pageTitle: string;
  switch (action.type) {
    case fromAction.SET_PAGE_TITLE:
      pageTitle = AppUtils.setPageTitle(action.payload);
      return {
        ...state,
        pageTitle
      };
    case fromAction.SET_PAGE_TITLE_ERRORS:
      pageTitle = `Error: ${state.pageTitle}`;
      return {
        ...state,
        pageTitle
      };
    case fromAction.LOGOUT:
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
}

export const getPageTitle = (state: AppState) => state.pageTitle;



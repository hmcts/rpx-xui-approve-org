import { Action } from '@ngrx/store';
import { GlobalError } from '../reducers/app.reducer';

export const SET_PAGE_TITLE = '[APP] Set Page Title';
export const SET_PAGE_TITLE_ERRORS = '[APP] Set Page Title Errors';

export const APP_ADD_GLOBAL_ERROR = '[APP] Add Global Error';
export const APP_ADD_GLOBAL_ERROR_SUCCESS = '[APP] Add Global Error Success';
export const APP_CLEAR_GLOBAL_ERROR = '[APP] Clear Global Error';


export const LOGOUT = '[App] Logout';

export class SetPageTitle implements Action {
  readonly type = SET_PAGE_TITLE;
  constructor(public payload: string) {}
}
/**
 * This is not used anywhere yet
 * it should be used when error displayed on the page.
 */
export class SetPageTitleErrors implements Action {
  readonly type = SET_PAGE_TITLE_ERRORS;
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class AddGlobalErrorSuccess implements Action {
  public readonly type = APP_ADD_GLOBAL_ERROR_SUCCESS;
  constructor() {}
}
export class AddGlobalError implements Action {
  public readonly type = APP_ADD_GLOBAL_ERROR;
  constructor(public payload: GlobalError) {}
}

export class ClearGlobalError implements Action {
  public readonly type = APP_CLEAR_GLOBAL_ERROR;
  constructor() {}
}


export type appActions =
  | SetPageTitle
  | SetPageTitleErrors
  | Logout
  | AddGlobalError
  | ClearGlobalError
  | AddGlobalErrorSuccess;

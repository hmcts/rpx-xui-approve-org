import { Action } from '@ngrx/store';
import {UserInterface} from '../../../models/user.model';
import {HttpErrorResponse} from '@angular/common/http';

export const SET_PAGE_TITLE = '[APP] Set Page Title';
export const SET_PAGE_TITLE_ERRORS = '[APP] Set Page Title Errors';

export const LOGOUT = '[App] Logout';

export const GET_USER_DETAILS = '[User] Get User Details';
export const GET_USER_DETAILS_SUCCESS = '[User] Get User Details Success';
export const GET_USER_DETAILS_FAIL = '[User]Get User Details Fail';

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

export const SIGNED_OUT = '[App] Signed Out'; // used by session management
export const SIGNED_OUT_SUCCESS = '[App] Signed Out Success'; // used by session management
export const KEEP_ALIVE = '[App] Keep Alive';
export const SET_MODAL = '[APP] Set Modal';


export class GetUserDetails implements Action {
  readonly type = GET_USER_DETAILS;
}

export class GetUserDetailsSuccess implements Action {
  readonly type = GET_USER_DETAILS_SUCCESS;
  constructor(public payload: UserInterface) {}
}

export class GetUserDetailsFailure implements Action {
  readonly type = GET_USER_DETAILS_FAIL;
  constructor(public payload: HttpErrorResponse) {}
}

export class SignedOut implements Action {
  readonly type = SIGNED_OUT;
}

export class SignedOutSuccess implements Action {
  readonly type = SIGNED_OUT_SUCCESS;
}

export class KeepAlive implements Action {
  readonly type = KEEP_ALIVE;
}

export class SetModal implements Action {
  readonly type = SET_MODAL;
  constructor(public payload: {[id: string]: {isVisible?: boolean; countdown?: string}}) { }
}


export type appActions =
  | SetPageTitle
  | SetPageTitleErrors
  | Logout
  | SetModal
  | SignedOut
  | KeepAlive
  | GetUserDetails
  | GetUserDetailsSuccess
  | GetUserDetailsFailure;


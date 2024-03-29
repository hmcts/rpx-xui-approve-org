import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';

import { UserInterface } from '../../../models/user.model';

export const GET_USER_DETAILS = '[User] Get User Details';
export const GET_USER_DETAILS_SUCCESS = '[User] Get User Details Success';
export const GET_USER_DETAILS_FAIL = '[User]Get User Details Fail';

export const APP_ADD_GLOBAL_ERROR = '[APP] Add Global Error';
export const APP_ADD_GLOBAL_ERROR_SUCCESS = '[APP] Add Global Error Success';
export const APP_CLEAR_GLOBAL_ERROR = '[APP] Clear Global Error';

export const LOGOUT = '[App] Logout';

export class Logout implements Action {
  public readonly type = LOGOUT;
}

export const SIGNED_OUT = '[App] Signed Out'; // used by session management
export const SIGNED_OUT_SUCCESS = '[App] Signed Out Success'; // used by session management
export const KEEP_ALIVE = '[App] Keep Alive';
export const SET_MODAL = '[APP] Set Modal';

export class GetUserDetails implements Action {
  public readonly type = GET_USER_DETAILS;
}

export class GetUserDetailsSuccess implements Action {
  public readonly type = GET_USER_DETAILS_SUCCESS;
  constructor(public payload: UserInterface) {}
}

export class GetUserDetailsFailure implements Action {
  public readonly type = GET_USER_DETAILS_FAIL;
  constructor(public payload: HttpErrorResponse) {}
}

export class SignedOut implements Action {
  public readonly type = SIGNED_OUT;
}

export class SignedOutSuccess implements Action {
  public readonly type = SIGNED_OUT_SUCCESS;
}

export class KeepAlive implements Action {
  public readonly type = KEEP_ALIVE;
}

export class SetModal implements Action {
  public readonly type = SET_MODAL;
  constructor(public payload: {[id: string]: {isVisible?: boolean; countdown?: string}}) {}
}

export class AddGlobalErrorSuccess implements Action {
  public readonly type = APP_ADD_GLOBAL_ERROR_SUCCESS;
}
export class AddGlobalError implements Action {
  public readonly type = APP_ADD_GLOBAL_ERROR;
  constructor(public payload) {}
}

export class ClearGlobalError implements Action {
  public readonly type = APP_CLEAR_GLOBAL_ERROR;
}

export type appActions =
  | GetUserDetails
  | GetUserDetailsSuccess
  | GetUserDetailsFailure
  | SignedOut
  | SignedOutSuccess
  | KeepAlive
  | SetModal
  | Logout
  | AddGlobalError
  | ClearGlobalError
  | AddGlobalErrorSuccess;

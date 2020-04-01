
import { Action } from '@ngrx/store';

export const REINVITE_PENDING_USER = '[Users] Reinvite Pending User';
export const SUBMIT_REINVITE_USER = '[Users] Submit Reinvite User';
export const SUBMIT_REINVITE_USER_SUCCESS = '[Users] Submit Reinvite User Success';
export const SUBMIT_REINVITE_USER_ERROR = '[Users] Submit Reinvite User Error';

export class ReinvitePendingUser implements Action {
  public readonly type = REINVITE_PENDING_USER;
  constructor(public payload) { }
}

export class SubmitReinviteUser implements Action {
  public readonly type = SUBMIT_REINVITE_USER;
  constructor(public payload) { }
}

export class SubmitReinviteUserSucces implements Action {
  public readonly type = SUBMIT_REINVITE_USER_SUCCESS;
  constructor(public payload) { }
}

export class SubmitReinviteUserError implements Action {
  public readonly type = SUBMIT_REINVITE_USER_ERROR;
  constructor(public payload: Error) { }
}

export type UsersAction =
  | ReinvitePendingUser
  | SubmitReinviteUser
  | SubmitReinviteUserSucces
  | SubmitReinviteUserError;


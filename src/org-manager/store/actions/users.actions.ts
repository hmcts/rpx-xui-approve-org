
import { Action } from '@ngrx/store';

export const SHOW_USER_DETAILS = '[Users]Show User Details';
export const REINVITE_PENDING_USER = '[Users] Reinvite Pending User';
export const SUBMIT_REINVITE_USER = '[Users] Submit Reinvite User';
export const SUBMIT_REINVITE_USER_SUCCESS = '[Users] Submit Reinvite User Success';
export const SUBMIT_REINVITE_USER_ERROR = '[Users] Submit Reinvite User Error';
export const UPDATE_ERROR_MESSAGES = '[Users] Update Error Messages';
export const SUBMIT_REINVITE_USER_ERROR_CODE_429 = '[Users] Submit Reinvite User Error With 429';

export class ShowUserDetails implements Action {
  public readonly type = SHOW_USER_DETAILS;
  constructor(public payload) { }
}

export class ReinvitePendingUser implements Action {
  public readonly type = REINVITE_PENDING_USER;
  constructor() { }
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
  constructor(public payload) { }
}

export class UpdateErrorMessages implements Action {
  public readonly type = UPDATE_ERROR_MESSAGES;
  constructor(public payload) { }
}

export class SubmitReinviteUserErrorCode429 implements Action {
  public readonly type = SUBMIT_REINVITE_USER_ERROR_CODE_429;
  constructor(public payload) { }
}

export type UsersAction =
  | ShowUserDetails
  | ReinvitePendingUser
  | SubmitReinviteUser
  | SubmitReinviteUserSucces
  | SubmitReinviteUserError
  | UpdateErrorMessages
  | SubmitReinviteUserErrorCode429;


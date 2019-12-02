
import { Action } from '@ngrx/store';
export const DISPATCH_SAVE_PBA_VALIDATION = '[Edit Details] Dispatch save PBA validation';
export const SUBMIT_PBA = '[Edit Details] Submit PBA';
export const SUBMIT_PBA_SUCCESS = '[Edit Details] Submit PBA Success';
export const SUBMIT_PBA_FAILURE = '[Edit Details] Submit PBA Failure';
export const CLEAR_ERRORS = '[Edit Details] Clear Errors';

export class DispatchSaveValidation implements Action {
  readonly type = DISPATCH_SAVE_PBA_VALIDATION;
  constructor(public payload: {isInvalid: object, errorMsg: any[]}) { }
}

export class SubmitPba implements Action {
  readonly type = SUBMIT_PBA;
  constructor(public payload: {paymentAccounts: string[]; orgId: string}) { }
}

export class SubmitPbaSuccess implements Action {
  readonly type = SUBMIT_PBA_SUCCESS;
  constructor(public payload: {paymentAccounts: string[], orgId: string}) { }
}

export class SubmitPbaFailure implements Action {
  readonly type = SUBMIT_PBA_FAILURE;
  constructor(public payload: Error) { }
}

export class ClearPbaErrors implements Action {
  readonly type = CLEAR_ERRORS;
}

export type EditDetailsActions =
  | DispatchSaveValidation
  | SubmitPba
  | SubmitPbaSuccess
  | SubmitPbaFailure
  | ClearPbaErrors;


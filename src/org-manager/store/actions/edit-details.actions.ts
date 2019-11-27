
import { Action } from '@ngrx/store';
export const DISPATCH_SUBMIT_VALIDATION = '[Edit Details] Dispatch submit validation';

export class DispatchSubmitValidation implements Action {
  readonly type = DISPATCH_SUBMIT_VALIDATION;
  constructor(public payload: {isInvalid: object, errorMsg: any[]}) { }
}


export type EditDetailsActions =
  | DispatchSubmitValidation;


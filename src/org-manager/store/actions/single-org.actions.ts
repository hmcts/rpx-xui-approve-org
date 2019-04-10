import {Action} from '@ngrx/store';
import {SingleOrgSummary} from '../../models/single-org-summary';

export const LOAD_SINGLE_ORG = '[Single Fee Account] Load Single Fee Account';
export const LOAD_SINGLE_ORG_SUCCESS = '[Single Fee Account] Load Single Fee Account Success';
export const LOAD_SINGLE_ORG_FAIL = '[Single Fee Account] Load Single Fee Account Fail';
export const RESET_SINGLE_ORG = '[Single Fee Account] Reset Single Fee Account';

export class LoadSingleOrg {
  readonly type = LOAD_SINGLE_ORG;
  constructor(public payload: any) {}
}

export class LoadSingleOrgSuccess  implements Action {
  readonly type = LOAD_SINGLE_ORG_SUCCESS;
  constructor(public payload: SingleOrgSummary) {}
}

export class LoadSingleOrgFail implements Action {
  readonly type = LOAD_SINGLE_ORG_FAIL;
  constructor(public payload: any) {}
}

export class ResetSingleOrg implements Action {
  readonly type = RESET_SINGLE_ORG;
  constructor(public payload: any) {}
}

export type SingleFeeAccountActions =
  | LoadSingleOrg
  | LoadSingleOrgSuccess
  | LoadSingleOrgFail
  | ResetSingleOrg


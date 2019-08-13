import {Action} from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export const LOAD_SINGLE_ORG = '[Single Org] Load Single Org';
export const LOAD_SINGLE_ORG_SUCCESS = '[Single Org] Load Single Org Success';
export const LOAD_SINGLE_ORG_FAIL = '[Single Org] Load Single Org Fail';
export const RESET_SINGLE_ORG = '[Single Org] Reset Single Org';

export class LoadSingleOrg {
  readonly type = LOAD_SINGLE_ORG;
  constructor(public payload: any) {}
}

export class LoadSingleOrgSuccess  implements Action {
  readonly type = LOAD_SINGLE_ORG_SUCCESS;
  constructor(public payload: OrganisationVM) {}
}

export class LoadSingleOrgFail implements Action {
  readonly type = LOAD_SINGLE_ORG_FAIL;
  constructor(public payload: any) {}
}

export class ResetSingleOrg implements Action {
  readonly type = RESET_SINGLE_ORG;
  constructor(public payload: any) {}
}

export type SinglePendingOrgActions =
  | LoadSingleOrg
  | LoadSingleOrgSuccess
  | LoadSingleOrgFail
  | ResetSingleOrg;

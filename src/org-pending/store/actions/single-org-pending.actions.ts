import {Action} from '@ngrx/store';
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary'


export enum SinglePendingOrgActionTypes {
   LOAD_SINGLE_ORG = '[Single Org] Load Single Org',
   LOAD_SINGLE_ORG_SUCCESS = '[Single Org] Load Single Org Success',
   LOAD_SINGLE_ORG_FAIL = '[Single Org] Load Single Org Fail',
  RESET_SINGLE_ORG = '[Single Org] Reset Single Org'

}

export class LoadSingleOrg {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_ORG;
  constructor(public payload: any) {}
}

export class LoadSingleOrgSuccess  implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_ORG_SUCCESS;
  constructor(public payload: SingleOrgSummary) {}
}

export class LoadSingleOrgFail implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_ORG_FAIL;
  constructor(public payload: any) {}
}

export class ResetSingleOrg implements Action {
  readonly type = SinglePendingOrgActionTypes.RESET_SINGLE_ORG;
  constructor(public payload: any) {}
}

export type SingleOrgActions =
  | LoadSingleOrg
  | LoadSingleOrgSuccess
  | LoadSingleOrgFail
  | ResetSingleOrg;

import {Action} from '@ngrx/store';
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary';

export enum SinglePendingOrgActionTypes {
   LOAD = '[Single Pending Organisation] Load Single Pending Organisation',
   LOAD_SUCCESS = '[Single Pending Organisation] Load Single Pending Organisations Success',
   LOAD_FAIL = '[Single Pending Organisation] Load Single Pending Organisation Fail',
   RESET_SINGLE_ORG = '[Single Pending Organisation] Reset Single Pending Organisation'
}

export class LoadSingleOrg {
  readonly type = SinglePendingOrgActionTypes.LOAD;
  constructor(public payload: any) {}
}

export class LoadSingleOrgSuccess  implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_SUCCESS;
  constructor(public payload: SingleOrgSummary) {}
}

export class LoadSingleOrgFail implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_FAIL;
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

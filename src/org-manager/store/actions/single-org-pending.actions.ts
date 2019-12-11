import {Action} from '@ngrx/store';
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary';

export enum SinglePendingOrgActionTypes {
   LOAD_SINGLE_PENDING_ORGANISATIONS = '[Single Pending Organisation] Load Single Pending Organisation',
   LOAD_SINGLE_PENDING_ORGANISATIONS_SUCCESS = '[Single Pending Organisation] Load Single Pending Organisations Success',
   LOAD_SINGLE_PENDING_ORGANISATIONS_FAIL = '[Single Pending Organisation] Load Single Pending Organisation Fail',
   RESET_SINGLE_ORG = '[Single Pending Organisation] Reset Single Pending Organisation'
}

export class LoadSinglePendingOrg {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS;
  constructor(public payload: any) {}
}

export class LoadSinglePendingOrgSuccess  implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_SUCCESS;
  constructor(public payload: SingleOrgSummary) {}
}

export class LoadSinglePendingOrgFail implements Action {
  readonly type = SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_FAIL;
  constructor(public payload: any) {}
}

export class ResetSinglePendingOrg implements Action {
  readonly type = SinglePendingOrgActionTypes.RESET_SINGLE_ORG;
  constructor(public payload: any) {}
}

export type SingleOrgActions =
  | LoadSinglePendingOrg
  | LoadSinglePendingOrgSuccess
  | LoadSinglePendingOrgFail
  | ResetSinglePendingOrg;

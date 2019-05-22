import {Action} from '@ngrx/store';
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary';


export enum SinglePendingOrgActionTypes {
   LOAD = 'Loading',
   LOAD_SUCCESS = 'f',
   LOAD_FAIL = 'f',
  RESET_SINGLE_ORG = 'f'

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

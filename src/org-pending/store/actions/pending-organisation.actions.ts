import {Action} from '@ngrx/store';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { PendingOrganisationsMock } from 'src/org-pending/mock/pending-organisation.mock';

export const LOAD_PENDING_ORGANISATIONS = '[Organisations] Load Organisations';
export const LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Organisations] Load Organisations Success';
export const LOAD_PENDING_ORGANISATIONS_FAIL = '[Organisations] Load Organisations Fail';


export class LoadPendingOrganisation {
  readonly type = LOAD_PENDING_ORGANISATIONS;
}

export class LoadPendingOrganisationSuccess  implements Action {
  readonly type = LOAD_PENDING_ORGANISATIONS_SUCCESS;
  constructor(public payload: any) {}

}

export class LoadPendingOrganisationFail implements Action {
  readonly type = LOAD_PENDING_ORGANISATIONS_FAIL;
  constructor(public payload: any) {}
}

export type PendingOrganisationActions =
  | LoadPendingOrganisation
  | LoadPendingOrganisationSuccess
  | LoadPendingOrganisationFail;


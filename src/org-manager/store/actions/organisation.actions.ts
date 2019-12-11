import {Action} from '@ngrx/store';

export const LOAD_ORGANISATIONS = '[Organisations] Load Organisations';
export const LOAD_ORGANISATIONS_SUCCESS = '[Organisations] Load Organisations Success';
export const LOAD_ORGANISATIONS_FAIL = '[Organisations] Load Organisations Fail';

export class LoadOrganisation {
  readonly type = LOAD_ORGANISATIONS;
}

export class LoadOrganisationSuccess  implements Action {
  readonly type = LOAD_ORGANISATIONS_SUCCESS;
  constructor(public payload: any[]) {}  // TODO add type list of users
}

export class LoadOrganisationFail implements Action {
  readonly type = LOAD_ORGANISATIONS_FAIL;
  constructor(public payload: any) {}
}

export type OrganisationActions =
  | LoadOrganisation
  | LoadOrganisationSuccess
  | LoadOrganisationFail;


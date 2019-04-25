import {Action} from '@ngrx/store';

export const SHOW_PENDING_ORG= '[Organisations] Load Pending Organisations';

export class LoadPendingOrganisation {
  readonly type = SHOW_PENDING_ORG;
  payload: true
}


export type PendingOrganisationActions =
  | LoadPendingOrganisation


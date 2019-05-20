
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { Action } from '@ngrx/store';

export enum PendingOrgActionTypes {
    LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
    LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
    LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Org] Load Fail'

}

export class LoadPendingOrganisations implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS;
}

export class LoadPendingOrganisationsSuccess implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS;

    constructor(public payload: PendingOrganisation[]) {}
}

export class LoadPendingOrganisationsFail implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL;

    constructor(public payload: string) {}
}

export type PendingOrgActions = 
| LoadPendingOrganisations
| LoadPendingOrganisationsSuccess
| LoadPendingOrganisationsFail;

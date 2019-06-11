
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { Action } from '@ngrx/store';

export enum PendingOrgActionTypes {
    LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
    LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
    LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Org] Load Fail',
    LOAD_PENDING_ORGANISATIONS_COUNT = '[Pending Organisations] Load Pending Organisations Count',
    LOAD_PENDING_ORGANISATIONS_COUNT_SUCCESS = '[Pending Organisations] Load Pending Organisations Count Success',
    LOAD_PENDING_ORGANISATIONS_COUNT_FAIL = '[Pending Organisations] Load Pending Organisations Count Fail',

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

    constructor(public payload: any) {}
}

export class LoadPendingOrganisationsCount implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT;
}

export class LoadPendingOrganisationsCountSuccess implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT_SUCCESS;

    constructor(public payload: String[]) {}
}

export class LoadPendingOrganisationsCountFail implements Action {
    readonly type = PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT_FAIL;

    constructor(public payload: any) {}
}

export type PendingOrgActions =
| LoadPendingOrganisations
| LoadPendingOrganisationsSuccess
| LoadPendingOrganisationsFail
| LoadPendingOrganisationsCount
| LoadPendingOrganisationsCountSuccess
| LoadPendingOrganisationsCountFail;

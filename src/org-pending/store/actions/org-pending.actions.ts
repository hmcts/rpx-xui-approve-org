
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { Action } from '@ngrx/store';

export enum PendingOrgActionTypes {
    LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
    LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
    LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Org] Load Fail',
    ADD_REVIEW_ORGANISATIONS = '[Pending Organisations] Add to Review Organisations'
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

export class AddReviewOrganisations implements Action {
    readonly type = PendingOrgActionTypes.ADD_REVIEW_ORGANISATIONS;

    constructor(public payload: PendingOrganisation[]) {}
}

export type PendingOrgActions =
| LoadPendingOrganisations
| LoadPendingOrganisationsSuccess
| LoadPendingOrganisationsFail
| AddReviewOrganisations;

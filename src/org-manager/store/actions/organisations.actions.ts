
import { Action } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export enum OrgActionTypes {
    LOAD_ACTIVE_ORGANISATIONS = '[Organisations] Load Active Organisations',
    LOAD_ACTIVE_ORGANISATIONS_SUCCESS = '[Organisations] Load Active Organisations Success',
    LOAD_ORGANISATIONS_FAIL = '[Organisations] Load Organisations Fail',
    LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
    LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
    LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Load Fail',
    ADD_REVIEW_ORGANISATIONS = '[Pending Organisations] Add to Review Organisations',
    DISPLAY_ERROR_MESSAGE_ORGANISATIONS = '[Pending Organisations] Display Error message Organisations',
    APPROVE_PENDING_ORGANISATIONS = '[Pending Organisations] Approve Pending Organisations',
    APPROVE_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Approve Pending Organisations Success',
    APPROVE_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Approve Pending Organisations Fail',
    CLEAR_ERRORS = '[Pending Organisations] Clear Errors',
}

export class LoadPendingOrganisations implements Action {
    readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS;
    constructor() { }
}

export class ClearErrors implements Action {
  readonly type = OrgActionTypes.CLEAR_ERRORS;
  constructor() { }
}

export class LoadPendingOrganisationsSuccess implements Action {
    readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS;

    constructor(public payload: OrganisationVM[]) { }
}

export class LoadPendingOrganisationsFail implements Action {
    readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL;

    constructor(public payload: any) { }
}

export class AddReviewOrganisations implements Action {
    readonly type = OrgActionTypes.ADD_REVIEW_ORGANISATIONS;

    constructor(public payload: OrganisationVM) { }
}

export class DisplayErrorMessageOrganisations implements Action {
    readonly type = OrgActionTypes.DISPLAY_ERROR_MESSAGE_ORGANISATIONS;

    constructor(public payload: any) { }
}

export class ApprovePendingOrganisations implements Action {
    readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS;
    constructor(public payload: OrganisationVM) { }
}

export class ApprovePendingOrganisationsSuccess implements Action {
    readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS;
    constructor(public payload: any) { }
}

export class ApprovePendingOrganisationsFail implements Action {
    readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL;
    constructor(public payload: any) { }
}

// Load Active Organisation Action
export class LoadOrganisation {
  readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS;
}

export class LoadOrganisationSuccess  implements Action {
  readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS_SUCCESS;
  constructor(public payload: any[]) {}  // TODO add type list of users
}

export class LoadOrganisationFail implements Action {
  readonly type = OrgActionTypes.LOAD_ORGANISATIONS_FAIL;
  constructor(public payload: any) {
  }
}

export type OrganisationsActions =
    | LoadPendingOrganisations
    | LoadPendingOrganisationsSuccess
    | LoadPendingOrganisationsFail
    | AddReviewOrganisations
    | DisplayErrorMessageOrganisations
    | ApprovePendingOrganisations
    | ApprovePendingOrganisationsSuccess
    | ApprovePendingOrganisationsFail
    | ClearErrors
    | LoadOrganisation
    | LoadOrganisationSuccess
    | LoadOrganisationFail;

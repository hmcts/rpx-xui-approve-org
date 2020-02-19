import { Action } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export enum OrgActionTypes {
    LOAD_ACTIVE_ORGANISATIONS = '[Organisations] Load Active Organisations',
    LOAD_ACTIVE_ORGANISATIONS_SUCCESS = '[Organisations] Load Active Organisations Success',
    LOAD_ORGANISATIONS_FAIL = '[Organisations] Load Organisations Fail',
    LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
    LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
    LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Load Fail',
    LOAD_ORGANISATION_USERS = '[Organisations] Load Single Organisation',
    LOAD_ORGANISATION_USERS_SUCCESS = '[Organisations] Load Single Organisation Success',
    LOAD_ORGANISATION_USERS_FAIL = '[Organisations] Load Single Organisation Fail',
    ADD_REVIEW_ORGANISATIONS = '[Pending Organisations] Add to Review Organisations',
    DISPLAY_ERROR_MESSAGE_ORGANISATIONS = '[Pending Organisations] Display Error message Organisations',
    APPROVE_PENDING_ORGANISATIONS = '[Pending Organisations] Approve Pending Organisations',
    APPROVE_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Approve Pending Organisations Success',
    APPROVE_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Approve Pending Organisations Fail',
    CLEAR_ERRORS = '[Pending Organisations] Clear Errors',
    UPDATE_ACTIVE_ORGANISATIONS_SEARCH_STRING = '[Organisations] Update Active Organisations Search String',
    UPDATE_PENDING_ORGANISATIONS_SEARCH_STRING = '[Pending Organisations] Update Pending Organisations Search String',
    LOAD_PBA_ACCOUNT_NAME = '[Organisations] Load Pba Account Name',
    LOAD_PBA_ACCOUNT_NAME_SUCCESS = '[Organisations] Load Pba Account Name Success',
    LOAD_PBA_ACCOUNT_NAME_FAIL = '[Organisations] Load Pba Account Name Fail'
}

export class LoadPendingOrganisations implements Action {
  public readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS;
    constructor() { }
}

export class ClearErrors implements Action {
  public readonly type = OrgActionTypes.CLEAR_ERRORS;
  constructor() { }
}

export class LoadPendingOrganisationsSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS;

    constructor(public payload: OrganisationVM[]) { }
}

export class LoadPendingOrganisationsFail implements Action {
  public readonly type = OrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL;

    constructor(public payload: any) { } // TODO change type it needs to change in the service used
}

export class AddReviewOrganisations implements Action {
  public readonly type = OrgActionTypes.ADD_REVIEW_ORGANISATIONS;

    constructor(public payload: OrganisationVM) { }
}

export class DisplayErrorMessageOrganisations implements Action {
  public readonly type = OrgActionTypes.DISPLAY_ERROR_MESSAGE_ORGANISATIONS;

    constructor(public payload: any) { } // TODO change type it needs to change in the service used
}

export class ApprovePendingOrganisations implements Action {
  public readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS;
    constructor(public payload: OrganisationVM) { }
}

export class ApprovePendingOrganisationsSuccess implements Action {
  public readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS;
    constructor(public payload: OrganisationVM) { }
}

export class ApprovePendingOrganisationsFail implements Action {
    readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL;
    constructor(public payload: any) { } // TODO change type it needs to change in the service used
}

// Load Active Organisation Action
export class LoadActiveOrganisation {
  readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS;
}

export class LoadActiveOrganisationSuccess  implements Action {
  public readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS_SUCCESS;
  constructor(public payload: OrganisationVM[]) {}
}

export class LoadActiveOrganisationFail implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATIONS_FAIL;
  constructor(public payload: Error) {
  }
}

export class UpdateActiveOrganisationsSearchString implements Action {
  public readonly type = OrgActionTypes.UPDATE_ACTIVE_ORGANISATIONS_SEARCH_STRING;
  constructor(public payload: string) {
  }
}

export class UpdatePendingOrganisationsSearchString implements Action {
  public readonly type = OrgActionTypes.UPDATE_PENDING_ORGANISATIONS_SEARCH_STRING;
  constructor(public payload: string) {
  }
}

export class LoadPbaAccountsDetails implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME;
  constructor(public payload: {pbas: string; orgId: string}) {
  }
}

export class LoadPbaAccountDetailsSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_SUCCESS;
  constructor(public payload: {orgId: string; data: any[]}) {
  }
}

export class LoadPbaAccountDetailsFail implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_FAIL;
  constructor(public payload: {orgId: string; data: any[]}) {
  }
}

export class LoadOrganisationUsers implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS;
  constructor(public payload: string) {
  }
}

export class LoadOrganisationUsersSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS_SUCCESS;
  constructor(public payload: any) {
  }
}

export class LoadOrganisationUsersFail implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS_FAIL;
  constructor(public payload: Error) {
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
    | LoadActiveOrganisation
    | LoadActiveOrganisationSuccess
    | LoadActiveOrganisationFail
    | UpdateActiveOrganisationsSearchString
    | UpdatePendingOrganisationsSearchString
    | LoadPbaAccountsDetails
    | LoadPbaAccountDetailsSuccess
    | LoadPbaAccountDetailsFail
    | LoadOrganisationUsers
    | LoadOrganisationUsersSuccess
    | LoadOrganisationUsersFail;

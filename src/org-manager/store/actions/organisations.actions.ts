import { Action } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export enum OrgActionTypes {
  LOAD_ACTIVE_ORGANISATIONS = '[Organisations] Load Active Organisations',
  LOAD_ACTIVE_ORGANISATIONS_SUCCESS = '[Organisations] Load Active Organisations Success',
  LOAD_ORGANISATIONS_FAIL = '[Organisations] Load Organisations Fail',
  LOAD_PENDING_ORGANISATIONS = '[Pending Organisations] Load Pending Organisations',
  LOAD_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Load Pending Organisations Success',
  LOAD_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Load Fail',
  LOAD_ORGANISATION_USERS = '[Organisations] Load Organisation Users',
  RESET_ORGANISATION_USERS = '[Organisations] Reset Organisation Users',
  LOAD_ORGANISATION_USERS_SUCCESS = '[Organisations] Load Single Organisation Success',
  LOAD_ORGANISATION_USERS_FAIL = '[Organisations] Load Single Organisation Fail',
  ADD_REVIEW_ORGANISATIONS = '[Pending Organisations] Add to Review Organisations',
  DISPLAY_ERROR_MESSAGE_ORGANISATIONS = '[Pending Organisations] Display Error message Organisations',
  APPROVE_PENDING_ORGANISATIONS = '[Pending Organisations] Approve Pending Organisations',
  APPROVE_PENDING_ORGANISATIONS_SUCCESS = '[Pending Organisations] Approve Pending Organisations Success',
  APPROVE_PENDING_ORGANISATIONS_FAIL = '[Pending Organisations] Approve Pending Organisations Fail',
  NAV_TO_DELETE_ORGANISATION = '[Pending Organisations] Navigate to Delete an Organisation',
  DELETE_PENDING_ORGANISATION = '[Pending Organisations] Delete Pending Organisation',
  DELETE_PENDING_ORGANISATION_SUCCESS = '[Pending Organisations] Delete Pending Organisation Success',
  DELETE_PENDING_ORGANISATION_FAIL = '[Pending Organisations] Delete Pending Organisation Fail',
  DELETE_ORGANISATION = '[Organisations] Delete Organisation',
  DELETE_ORGANISATION_SUCCESS = '[Organisations] Delete Organisation Success',
  CLEAR_ERRORS = '[Pending Organisations] Clear Errors',
  UPDATE_ACTIVE_ORGANISATIONS_SEARCH_STRING = '[Organisations] Update Active Organisations Search String',
  UPDATE_PENDING_ORGANISATIONS_SEARCH_STRING = '[Pending Organisations] Update Pending Organisations Search String',
  LOAD_PBA_ACCOUNT_NAME = '[Organisations] Load Pba Account Name',
  LOAD_PBA_ACCOUNT_NAME_SUCCESS = '[Organisations] Load Pba Account Name Success',
  LOAD_PBA_ACCOUNT_NAME_FAIL = '[Organisations] Load Pba Account Name Fail',
  SHOW_ORGANISATION_DETAILS_USER_TAB = '[Organisation] Show Organisation Details User Tab',
  GET_ORGANISATION_DELETABLE_STATUS = '[Organisation] Get Organisation Deletable Status',
  GET_ORGANISATION_DELETABLE_STATUS_SUCCESS = '[Organisation] Get Organisation Deletable Status Success',
  UPDATE_ORGANISATIONS_SEARCH_STRING = '[Organisations] Update Organisations Search String'
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
  public readonly type = OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL;
  constructor(public payload: any) { } // TODO change type it needs to change in the service used
}

export class NavigateToDeleteOrganisation implements Action {
  public readonly type = OrgActionTypes.NAV_TO_DELETE_ORGANISATION;

  constructor(public payload: OrganisationVM) { }
}

export class DeletePendingOrganisation implements Action {
  public readonly type = OrgActionTypes.DELETE_PENDING_ORGANISATION;
  constructor(public payload: OrganisationVM) { }
}

export class DeletePendingOrganisationSuccess implements Action {
  public readonly type = OrgActionTypes.DELETE_PENDING_ORGANISATION_SUCCESS;
  constructor(public payload: OrganisationVM) { }
}

export class DeletePendingOrganisationFail implements Action {
  public readonly type = OrgActionTypes.DELETE_PENDING_ORGANISATION_FAIL;
  constructor() { }
}

export class DeleteOrganisation implements Action {
  public readonly type = OrgActionTypes.DELETE_ORGANISATION;
  constructor(public payload: OrganisationVM) { }
}

export class DeleteOrganisationSuccess implements Action {
  public readonly type = OrgActionTypes.DELETE_ORGANISATION_SUCCESS;
  constructor(public payload: OrganisationVM) { }
}

// Load Active Organisation Action
export class LoadActiveOrganisation {
  public readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS;
}

export class LoadActiveOrganisationSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS_SUCCESS;
  constructor(public payload: OrganisationVM[]) {}
}

export class LoadActiveOrganisationFail implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATIONS_FAIL;
  constructor(public payload: Error) {}
}

export class UpdateActiveOrganisationsSearchString implements Action {
  public readonly type = OrgActionTypes.UPDATE_ACTIVE_ORGANISATIONS_SEARCH_STRING;
  constructor(public payload: string) {}
}

export class UpdatePendingOrganisationsSearchString implements Action {
  public readonly type = OrgActionTypes.UPDATE_PENDING_ORGANISATIONS_SEARCH_STRING;
  constructor(public payload: string) {}
}

export class LoadPbaAccountsDetails implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME;
  constructor(public payload: {pbas: string; orgId: string}) {}
}

export class LoadPbaAccountDetailsSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_SUCCESS;
  constructor(public payload: {orgId: string; data: any[]}) {}
}

export class LoadPbaAccountDetailsFail implements Action {
  public readonly type = OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_FAIL;
  constructor(public payload: {orgId: string; data: any[]}) {}
}

export class LoadOrganisationUsers implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS;
  constructor(public payload: string) {}
}

export class LoadOrganisationUsersSuccess implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS_SUCCESS;
  constructor(public payload: any) {}
}

export class LoadOrganisationUsersFail implements Action {
  public readonly type = OrgActionTypes.LOAD_ORGANISATION_USERS_FAIL;
  constructor(public payload: Error) {}
}

export class ResetOrganisationUsers implements Action {
  public readonly type = OrgActionTypes.RESET_ORGANISATION_USERS;
  constructor() { }
}

export class ShowOrganisationDetailsUserTab implements Action {
  public readonly type = OrgActionTypes.SHOW_ORGANISATION_DETAILS_USER_TAB;
  constructor(public payload: {orgId: string; showUserTab: boolean}) { }
}

export class GetOrganisationDeletableStatus implements Action {
  public readonly type = OrgActionTypes.GET_ORGANISATION_DELETABLE_STATUS;
  constructor(public payload: string) { }
}

export class GetOrganisationDeletableStatusSuccess implements Action {
  public readonly type = OrgActionTypes.GET_ORGANISATION_DELETABLE_STATUS_SUCCESS;
  constructor(public payload: boolean) { }
}

export class UpdateOrganisationsSearchString implements Action {
  public readonly type = OrgActionTypes.UPDATE_ORGANISATIONS_SEARCH_STRING;
  constructor(public payload: string) {}
}

export type OrganisationsActions =
    | LoadPendingOrganisations
    | LoadPendingOrganisationsSuccess
    | LoadPendingOrganisationsFail
    | AddReviewOrganisations
    | NavigateToDeleteOrganisation
    | DeletePendingOrganisationSuccess
    | DeleteOrganisationSuccess
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
    | LoadOrganisationUsersFail
    | ResetOrganisationUsers
    | ShowOrganisationDetailsUserTab
    | GetOrganisationDeletableStatusSuccess
    | UpdateOrganisationsSearchString;

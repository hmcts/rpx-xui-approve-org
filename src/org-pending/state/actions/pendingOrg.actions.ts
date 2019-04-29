
import { PendingOrganisation } from "src/org-pending/models/pending-organisation";
import { Action } from "@ngrx/store";

export enum PendingOrgActionTypes {
    TogglePendingOrgCode = '[Pending Org] Toggle Pending Org',
    SetCurrentPendingOrg = '[Pending Org] Set Current Pending Org',
    Load = '[Pending Org] Load',
    LoadSuccess = '[Pending Org] Load Success',
    LoadFail = '[Pending Org] Load Fail'

}

export class TogglePendingOrgCode implements Action {
    readonly type = PendingOrgActionTypes.TogglePendingOrgCode;

    constructor(public payload: boolean){}
    
}

export class SetCurrentPendingOrg implements Action {
    readonly type = PendingOrgActionTypes.SetCurrentPendingOrg;

    constructor(public payload: PendingOrganisation){}
}

export class Load implements Action {
    readonly type = PendingOrgActionTypes.Load;
}

export class LoadSuccess implements Action {
    readonly type = PendingOrgActionTypes.LoadSuccess;

    constructor(public payload: PendingOrganisation[]){}
}

export class LoadFail implements Action {
    readonly type = PendingOrgActionTypes.LoadFail;

    constructor(public payload: string){}
}

export type PendingOrgActions = TogglePendingOrgCode
| SetCurrentPendingOrg
| Load
| LoadSuccess
| LoadFail;

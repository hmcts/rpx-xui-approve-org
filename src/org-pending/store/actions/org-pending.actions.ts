
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { Action } from '@ngrx/store';

export enum PendingOrgActionTypes {
    TogglePendingOrgCode = '[Pending Org] Toggle Pending Org',
    SetCurrentPendingOrg = '[Pending Org] Set Current Pending Org',
    Load = '[Pending Org] Load',
    LoadSuccess = '[Pending Org] Load Success',
    LoadFail = '[Pending Org] Load Fail'

}

export class LoadPendingOrganisations implements Action {
    readonly type = PendingOrgActionTypes.Load;
}

export class LoadPendingOrganisationsSuccess implements Action {
    readonly type = PendingOrgActionTypes.LoadSuccess;

    constructor(public payload: PendingOrganisation[]) {}
}

export class LoadPendingOrganisationsFail implements Action {
    readonly type = PendingOrgActionTypes.LoadFail;

    constructor(public payload: string) {}
}

export type PendingOrgActions = 
| LoadPendingOrganisations
| LoadPendingOrganisationsSuccess
| LoadPendingOrganisationsFail;

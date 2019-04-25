import { PendingOrganisation } from "../models/pending-organisation";
import * as fromRoot from '../../app/store/reducers/app.reducer'

export interface State extends fromRoot.AppState {
    pendingdOrgs: PendingOrganisationState;
}

export interface PendingOrganisationState{
    showPendingOrg: boolean;
    currentOrg: PendingOrganisation;
    pendingOrganisations: PendingOrganisation[]; 
}

const initialState: PendingOrganisationState = {
    showPendingOrg: true,
    currentOrg: null,
    pendingOrganisations:[]
}

export function reducer(state = initialState,action): PendingOrganisationState {
    switch(action.type) {

        case 'SHOW_PENDING_ORG':
            console.log('existing state: ' + JSON.stringify(state));
            console.log('payload' + action.payload);
            return {
                ...state,
                showPendingOrg: action.payload
            }
        default:
        return state;
}
}
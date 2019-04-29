import { PendingOrganisation } from "../../models/pending-organisation";
import * as fromRoot from '../../../app/store/reducers/app.reducer'
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PendingOrgActions, PendingOrgActionTypes } from "../actions/org-pending.actions";

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
};

const getPendingOrgsFeatureState = createFeatureSelector<PendingOrganisationState>('org-pending');

export const getShowPendingOrgCode = createSelector(
    getPendingOrgsFeatureState,
    state => state.showPendingOrg
)

export const getCurrentOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.currentOrg
)

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.pendingOrganisations
)
export function reducer(state = initialState,action: PendingOrgActions): PendingOrganisationState {
    switch(action.type) {

        case PendingOrgActionTypes.TogglePendingOrgCode:
            console.log('existing state: ' + JSON.stringify(state));
            console.log('payload' + action.payload);
            return {
                ...state,
                showPendingOrg: action.payload
            }

        case PendingOrgActionTypes.SetCurrentPendingOrg:
        return {
            ...state,
            currentOrg: {...action.payload}
        };

        case PendingOrgActionTypes.LoadSuccess:
        return {
            ...state,
            pendingOrganisations:  action.payload
        }
        default:
        return state;
}
}
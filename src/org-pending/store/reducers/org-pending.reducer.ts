import { PendingOrganisation } from '../../models/pending-organisation';
import * as fromRoot from '../../../app/store/reducers/app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';

export interface PendingOrganisationState {
    //showPendingOrg: boolean;
    //currentOrg: PendingOrganisation;
    pendingOrganisations: PendingOrganisation[];
    loaded: boolean;
    loading: boolean;
}

const initialState: PendingOrganisationState = {
    //showPendingOrg: true,
    //currentOrg: null,
    pendingOrganisations: null,
    loaded: false,
    loading: false
};

export function reducer(
    state = initialState, 
    action: PendingOrgActions
    ): PendingOrganisationState {
    switch (action.type) {
        case PendingOrgActionTypes.Load: {
            console.log('in load')
            return {
              ...state,
              loaded: false,
              loading: true
            };
          }
        case PendingOrgActionTypes.LoadSuccess: 
        return {
            ...state,
            pendingOrganisations:  action.payload,
            loaded: true,
            loading: false
        };
        default:
        return state;
}
}

export const getPendingOrganisations = (state: PendingOrganisationState) => state.pendingOrganisations;
export const getPendingOrganisationsLoading = (state: PendingOrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: PendingOrganisationState) => state.loaded;

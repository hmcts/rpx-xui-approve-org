import { PendingOrganisation, PendingOrganisationSummary } from '../../models/pending-organisation';
import * as fromRoot from '../../../app/store/reducers/app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';

export interface PendingOrganisationState {
    pendingOrganisations: PendingOrganisation[];
    loaded: boolean;
    loading: boolean;
}

const initialState: PendingOrganisationState = {
    pendingOrganisations: null,
    loaded: false,
    loading: false
};

export function reducer(
    state = initialState,
    action: PendingOrgActions
    ): PendingOrganisationState {
    switch (action.type) {
        case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
            console.log('in load');
            return {
              ...state,
              loaded: false,
              loading: true
            };
          }
        case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS:
        let pendingOrganisations = action.payload;
        if (pendingOrganisations.length !== 0) {
            pendingOrganisations = pendingOrganisations.map((pendingOrganisation: PendingOrganisation) => {
                const pendingOrgDetail: PendingOrganisationSummary = {
                  ...pendingOrganisation,
                  routerLink: `/pending-organisations/pending-organisation/${pendingOrganisation.pbaNumber}/`
                };
                return pendingOrgDetail;
              });
          }
        return {
            ...state,
            pendingOrganisations:  pendingOrganisations,
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

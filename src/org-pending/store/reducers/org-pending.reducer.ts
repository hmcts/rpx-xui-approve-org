import { PendingOrganisation, PendingOrganisationSummary } from '../../models/pending-organisation';
import * as fromRoot from '../../../app/store/reducers/app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';
import { RouterLink } from '@angular/router';

export interface PendingOrganisationState {
    pendingOrganisations: Array<any> | null;
    loaded: boolean;
    loading: boolean;
    count: String;
}

export const initialState: PendingOrganisationState = {
    pendingOrganisations: null,
    loaded: false,
    loading: false,
    count: null
};

export function reducer(
    state = initialState,
    action: PendingOrgActions
    ): PendingOrganisationState {
    switch (action.type) {
        case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
            return {
              ...state,
              loaded: false,
              loading: true
            };
          }
        case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
          let pendingOrganisations = action.payload;
          if (pendingOrganisations.length !== 0) {
            pendingOrganisations = action.payload.map((pendingOrganisation: PendingOrganisation) => {
                const routerLink: PendingOrganisationSummary = {
                  ...pendingOrganisation,
                  routerLink: `/pending-organisations/pending-organisation/${pendingOrganisation.pbaNumber}/`
                };
                return routerLink;
              });
          }

        return {
            ...state,
            pendingOrganisations:  pendingOrganisations,
            loaded: true,
            loading: false
        };
      }

      case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT: {
        console.log('in load')
        return {
          ...state,
          loaded: false,
          loading: true,
          count: null
        };
      }

      case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT_SUCCESS: {
        console.log('in success')
        console.log('payload is',action.payload)
        let pendingOrganisationsCount = action.payload;

      return {
          ...state,
          count:  pendingOrganisationsCount,
          loaded: true,
          loading: false
      };
    }
        default:
        return state;
}
}

export const getPendingOrganisations = (state: PendingOrganisationState) => state.pendingOrganisations;
export const getPendingOrganisationsLoading = (state: PendingOrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: PendingOrganisationState) => state.loaded;

export const getPendingOrganisationsCount = (state: PendingOrganisationState) => state.count;

import { PendingOrganisation, PendingOrganisationSummary } from '../../models/pending-organisation';
import * as fromRoot from '../../../app/store/reducers/app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';
import { RouterLink } from '@angular/router';

export interface PendingOrganisationState {
  pendingOrganisations: Array<any> | null;
  reviewedOrganisations: Array<any> | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: PendingOrganisationState = {
  pendingOrganisations: null,
  reviewedOrganisations: null,
  loaded: false,
  loading: false
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
    case PendingOrgActionTypes.ADD_REVIEW_ORGANISATIONS: {
      const reviewedOrganisations = action.payload;
      return {
        ...state,
        reviewedOrganisations: reviewedOrganisations,
        loaded: false,
        loading: true
      };
    }
    case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      // TODO please fix this - something is not right
      let pendingOrganisations = action.payload;
      if (pendingOrganisations.length !== 0) {
        pendingOrganisations = action.payload.map((pendingOrganisation: PendingOrganisation) => {
            const routerLink: PendingOrganisationSummary = {
              ...pendingOrganisation,
              routerLink: `/pending-organisations/organisation/${pendingOrganisation.pbaNumber}/`
            };
            return routerLink;
          });
      }
    return {
        ...state,
        pendingOrganisations:  pendingOrganisations,
        loaded: true,
        loading: false,
    };
  }

    default:
      return state;
  }
}

export const getPendingOrganisations = (state: PendingOrganisationState) => state.pendingOrganisations;
export const getPendingOrganisationsLoading = (state: PendingOrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: PendingOrganisationState) => state.loaded;
export const getReviewedOrganisations = (state: PendingOrganisationState) => state.reviewedOrganisations;

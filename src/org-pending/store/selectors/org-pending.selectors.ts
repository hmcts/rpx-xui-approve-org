import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const getPendingOrgsFeatureState = createFeatureSelector<fromOrganisation.PendingOrganisationState>('org-pending');

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.pendingOrganisations
);

export const getReviewedOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.reviewedOrganisations
);

export const pendingOrganisations = createSelector( getPendingOrgsFeatureState, fromOrganisation.getPendingOrganisations);
export const pendingOrganisationsLoading = createSelector( getPendingOrgsFeatureState,     state => state.loading);
export const reviewedOrganisations = createSelector( getPendingOrgsFeatureState, fromOrganisation.getReviewedOrganisations);

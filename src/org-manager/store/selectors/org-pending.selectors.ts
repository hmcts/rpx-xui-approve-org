import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const getPendingOrgsFeatureState = createFeatureSelector<fromOrganisation.OrganisationState>('organisations');

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state
);

export const pendingOrganisations = createSelector( getPendingOrgsFeatureState, fromOrganisation.getPendingOrganisations);
export const reviewedOrganisations = createSelector( getPendingOrgsFeatureState, fromOrganisation.getReviewedOrganisations);
export const errorOganisations = createSelector( getPendingOrgs, fromOrganisation.getErrorMessage);

// TODO remove string and fix typings
export const pendingOrganisationsCount = createSelector(
  pendingOrganisations,
  (orgArr) =>  orgArr['pendingOrganisations'] ? orgArr['pendingOrganisations'].length : 0
);
export const pendingOrganisationsLoading = createSelector(
  getPendingOrgsFeatureState,
  state => state.loading
);


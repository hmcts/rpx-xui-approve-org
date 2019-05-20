import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const getPendingOrgsFeatureState = createFeatureSelector<fromOrganisation.PendingOrganisationState>('org-pending');

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.pendingOrganisations
);

export const organisationsLoading = createSelector( getPendingOrgsFeatureState,     state => state.loading);

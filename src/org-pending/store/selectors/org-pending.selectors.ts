import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from '../../../app/store';

const getPendingOrgsFeatureState = createFeatureSelector<fromOrganisation.PendingOrganisationState>('org-pending');

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.pendingOrganisations
);

export const pendingOrganisations = createSelector( getPendingOrgsFeatureState, fromOrganisation.getPendingOrganisations);

export const pendingOrganisationsLoading = createSelector( getPendingOrgsFeatureState,     state => state.loading);

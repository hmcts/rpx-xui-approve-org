import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const getPendingOrgsFeatureState = createFeatureSelector<fromOrganisation.PendingOrganisationState>('org-pending');

export const getShowPendingOrgCode = createSelector(
    getPendingOrgsFeatureState,
    state => state.showPendingOrg
);

export const getCurrentOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.currentOrg
);

export const getPendingOrgs = createSelector(
    getPendingOrgsFeatureState,
    state => state.pendingOrganisations
);

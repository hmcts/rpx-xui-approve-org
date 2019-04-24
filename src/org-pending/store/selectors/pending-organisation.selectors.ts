import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromPendingOrganisation from '../reducers/pending-organisation.reducer';



export const selectFeatureOrg = createFeatureSelector<fromFeature.PendingOrganisationState>('org-pending');
export const getPendingOrganisationsState = createSelector( selectFeatureOrg, (state: any) => state.pendingOrganisations);
export const pendingOrganisations = createSelector( getPendingOrganisationsState, fromPendingOrganisation.getPendingOrganisations);
export const pendingOrganisationsLoading = createSelector( getPendingOrganisationsState, fromPendingOrganisation.getPendingOrganisationsLoading);
export const pendingOrganisationsLoaded = createSelector( getPendingOrganisationsState, fromPendingOrganisation.getPendingOrganisationsLoaded);

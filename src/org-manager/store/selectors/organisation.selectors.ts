import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromOrganisation from '../reducers/organisation.reducer';



export const selectFeatureOrg = createFeatureSelector<fromFeature.OrganisationState>('organisations');
export const getOrganisationsState = createSelector( selectFeatureOrg, (state: any) => state.organisations);
export const organisations = createSelector( getOrganisationsState, fromOrganisation.getOrganisations);
export const organisationsLoading = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoading);
export const organisationsLoaded = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoaded);

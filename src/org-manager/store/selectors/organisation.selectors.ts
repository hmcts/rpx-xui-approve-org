import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromOrganisation from '../reducers/organisation.reducer';
import * as fromRoot from '../../../app/store';



export const selectFeatureOrg = createFeatureSelector<fromFeature.OrganisationState>('organisations');
export const getOrganisationsState = createSelector( selectFeatureOrg, (state: any) => state.organisations);
export const organisations = createSelector( getOrganisationsState, fromOrganisation.getOrganisations);
export const organisationsLoading = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoading);
export const organisationsLoaded = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoaded);

export const getCurrentPage = createSelector(
    fromRoot.getRouterState,
    (router) => router.state.params
  );

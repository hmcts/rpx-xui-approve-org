import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromOrganisation from '../reducers/organisation.reducer';
import * as fromRoot from '../../../app/store';
import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';
import { OrganisationState } from '../reducers/org-pending.reducer';



export const selectFeatureOrg = createFeatureSelector<fromFeature.OrganisationState>('organisations');
export const getOrganisationsState = createSelector( selectFeatureOrg, (state: any) => state.organisations);
export const organisations = createSelector( getOrganisationsState, fromOrganisation.getOrganisations);
export const selectedOrganisation = (orgId: string) => createSelector( getOrganisationsState, (organisationState: any) => {
  if (organisationState && organisationState.organisations) {
    return organisationState.organisations.filter(x => x.organisationId === orgId) as OrganisationVM;
  } else {
    return {};
  }
});
export const organisationsLoading = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoading);
export const organisationsLoaded = createSelector( getOrganisationsState, fromOrganisation.getOrganisationsLoaded);

export const getCurrentPage = createSelector(
    fromRoot.getRouterState,
    (router) => router.state.params
  );

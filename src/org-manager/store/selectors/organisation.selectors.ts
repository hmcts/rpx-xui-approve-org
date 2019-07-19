import {createFeatureSelector, createSelector} from '@ngrx/store';


import * as fromOrganisation from '../reducers/organisation.reducer';
import * as fromRoot from '../../../app/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';

import {getRootApproveOrgState} from '../reducers';

export const getOrganisationsState = createSelector(
  getRootApproveOrgState,
  (state: any) => state.activeOrg
);

export const getPendingOrganisationsState = createSelector(
  getRootApproveOrgState,
  (state: any) => state.pendingOrganisations
);
export const organisations = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrganisations
);
export const selectedOrganisation = createSelector(
  getOrganisationsState,
  fromRoot.getRouterState,
  (organisationState: any, router) => {
  if (organisationState && organisationState.organisations) {
    return organisationState.organisations.filter(x => x.organisationId === router.state.params.id)[0];
  } else {
    return {};
  }
});
export const selectedPendingOrganisation = (orgId: string) => createSelector( getPendingOrganisationsState, (organisationState: any) => {
  if (organisationState && organisationState.pendingOrganisations) {
    return organisationState.pendingOrganisations.filter(x => x.organisationId === orgId) as OrganisationVM;
  } else {
    return {};
  }
});
export const organisationsLoading = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrganisationsLoading
);
export const organisationsLoaded = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrganisationsLoaded
);

export const getCurrentPage = createSelector(
    fromRoot.getRouterState,
    (router) => router.state.params
  );

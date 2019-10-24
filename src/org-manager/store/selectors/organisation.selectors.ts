import { createSelector } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import { getRootApproveOrgState } from '../reducers';
import * as fromOrganisation from '../reducers/organisation.reducer';

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
    return organisationState.organisations.filter((x: any) => x.organisationId === router.state.params.id)[0];
  } else {
    return {};
  }
});
export const selectedPendingOrganisation = (orgId: string) => createSelector( getPendingOrganisationsState, (organisationState: any) => {
  if (organisationState && organisationState.pendingOrganisations) {
    return organisationState.pendingOrganisations.filter((x: any) => x.organisationId === orgId) as OrganisationVM;
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

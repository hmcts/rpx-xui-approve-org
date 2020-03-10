import {createSelector} from '@ngrx/store';

import * as fromRoot from '../../../app/store';
import * as fromOrganisation from '../reducers';

export const getOrganisationsState = createSelector(
  fromOrganisation.getRootApproveOrgState,
  (state: fromOrganisation.OrganisationRootState) => state.organisations
);
// entry for Active Organisations
export const getActiveOrganisationState = createSelector(
  getOrganisationsState,
  fromOrganisation.getActiveOrgEntities
);

export const getActiveOrganisation = createSelector(
  getActiveOrganisationState,
  (orgState) => orgState.orgEntities
);

export const getActiveOrganisationArray = createSelector(
  getActiveOrganisation,
  (orgState) => Object.keys(orgState).map(id => orgState[id])
);

export const getActiveLoaded = createSelector(
  getActiveOrganisationState,
  (orgState) => orgState.loaded
);

export const getActiveLoading = createSelector(
  getActiveOrganisationState,
  (orgState) => orgState.loading
);
// entry for Pending Organisations
export const getPendingOrganisationsState = createSelector(
  getOrganisationsState,
  fromOrganisation.getPendingOrgEntities
);

export const getPendingOrganisations = createSelector(
  getPendingOrganisationsState,
  (orgsArray) => orgsArray.orgEntities
);

export const getPendingOrganisationsArray = createSelector(
  getPendingOrganisations,
  (orgEntities) => Object.keys(orgEntities).map(orgId => orgEntities[orgId])
);
export const getPendingLoaded = createSelector(
  getPendingOrganisationsState,
  (orgState) => orgState.loaded
);
//

export const getErrorMessage = createSelector(
  getOrganisationsState,
  (orgState) => orgState.errorMessage
);

export const getActiveAndPending = createSelector(
  getActiveOrganisationState,
  getPendingOrganisationsState,
  fromRoot.getRouterState,
  (active, pending, router) =>
      (active.orgEntities[router.state.params.orgId]) ||
      (pending.orgEntities[router.state.params.orgId]
    ));


export const getPbaNumber = createSelector(
  fromRoot.getRouterState,
  (router) => router.state.params.id || ''
);

export const getAllLoaded = createSelector(
  getActiveLoaded,
  getPendingLoaded,
  (activeLoaded, pendingLoaded) =>  activeLoaded && pendingLoaded
);

export const getOrganisationForReview = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrgForReview
);

export const pendingOrganisationsCount = createSelector(
  getPendingOrganisationsArray,
  (orgArr) =>  orgArr ? orgArr.length : 0
);


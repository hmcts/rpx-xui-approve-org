import { createSelector } from '@ngrx/store';

import * as fromRoot from '../../../app/store';
import { OrganisationVM } from '../../models/organisation';
import * as fromOrganisation from '../reducers';
import * as fromPendingOrganisations from '../reducers/organisation.reducer';

export const getOrganisationsState = createSelector(
  fromOrganisation.getRootApproveOrgState,
  (state: fromOrganisation.OrganisationRootState) => (state && state.organisations) ? state.organisations : fromPendingOrganisations.initialState
);

export const getSearchString = createSelector(
  getOrganisationsState,
  (orgState) => orgState.searchString
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

export const getActiveSearchString = createSelector(
  getActiveOrganisationState,
  (orgState) => orgState.searchString
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


export const getPendingSearchString = createSelector(
  getPendingOrganisationsState,
  (orgState) => orgState.searchString
);
//

export const getErrorMessage = createSelector(
  getOrganisationsState,
  (orgState) => orgState.errorMessage
);

export const getActiveByOrgIds = createSelector(
  getActiveOrganisationState,
  (active: { orgEntities: { [id: string]: OrganisationVM } }, props: { orgIds: string[] }) => {
    return props.orgIds.map(orgId => active.orgEntities[orgId]).filter(val => val !== undefined);
  }
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

export const activeOrganisationsCount = createSelector(
  getActiveOrganisationArray,
  (orgArr) =>  orgArr ? orgArr.length : 0
);

export const getOrganisationUsersList = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrgUsersList
);

export const getShowOrgDetailsUserTabSelector = createSelector(
  getOrganisationsState,
  fromOrganisation.getShowOrgDetailsUserTab
);

export const getOrganisationDeletable = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrgDeletable
);

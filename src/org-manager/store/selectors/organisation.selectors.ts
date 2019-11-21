import {createSelector} from '@ngrx/store';

import * as fromRoot from '../../../app/store';
import * as fromOrganisation from '../reducers';
import { OrganisationVM } from 'src/org-manager/models/organisation';

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
/////

export const getErrorMessage = createSelector(
  getOrganisationsState,
  (orgState) => orgState.errorMessage
);

export const selectedActiveOrganisation = createSelector(
  getOrganisationsState,
  fromRoot.getRouterState,
  (organisationState: fromOrganisation.OrganisationState, router) => {
    return organisationState[router.state.params.type] ?
      organisationState[router.state.params.type].orgEntities[router.state.params.id] : null;
  });

export const getOrganisationForReview = createSelector(
  getOrganisationsState,
  fromOrganisation.getOrgForReview
);

export const pendingOrganisationsCount = createSelector(
  getPendingOrganisationsArray,
  (orgArr) =>  orgArr ? orgArr.length : 0
);


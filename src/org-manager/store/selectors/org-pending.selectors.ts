import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createSelector } from '@ngrx/store';
import {getRootApproveOrgState} from '../reducers';

export const getPendingOrgs = createSelector(
    getRootApproveOrgState,
    state => state.pendingOrganisations
);

export const pendingOrganisations = createSelector(
  getPendingOrgs,
  fromOrganisation.getPendingOrganisations
);

export const reviewedOrganisations = createSelector(
  getPendingOrgs,
  fromOrganisation.getReviewedOrganisations
);

// TODO remove string and fix typings
export const pendingOrganisationsCount = createSelector(
  pendingOrganisations,
  (orgArr) =>  orgArr ? orgArr.length : 0
);

export const pendingOrganisationsLoading = createSelector(
  getPendingOrgs,
  state => state.loading
);

export const getPendingOrgResponseMsgs = createSelector(
  getPendingOrgs,
  fromOrganisation.dgetPendingOrgResponseMsg
);


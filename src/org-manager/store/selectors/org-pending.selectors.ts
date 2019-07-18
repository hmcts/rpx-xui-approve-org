import * as fromOrganisation from '../reducers/org-pending.reducer';
import { createSelector } from '@ngrx/store';
import {getRootApproveOrgState} from '../reducers';

export const getPendingOrgs = createSelector(
    getRootApproveOrgState,
    state => state.pendingOrganisations
);

export const reviewedOrganisations = createSelector(
  getPendingOrgs,
  fromOrganisation.getReviewedOrganisations
);

export const pendingOrganisationsCount = createSelector(
  getPendingOrgs,
  (orgArr) =>  orgArr ? orgArr.pendingOrganisations.length : 0
);

export const pendingOrganisationsLoading = createSelector(
  getPendingOrgs,
  state => state.loading
);

export const getPendingOrgResponseMsgs = createSelector(
  getPendingOrgs,
  fromOrganisation.dgetPendingOrgResponseMsg
);


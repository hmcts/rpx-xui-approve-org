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


export const getErrorMessages = createSelector(
  getPendingOrgs,
  fromOrganisation.dgetPendingOrgResponseMsg
);


export const pendingOrganisationsCount = createSelector(
  getPendingOrgs,
  (orgArr) =>  orgArr ? orgArr.pendingOrganisations.length : 0
);

export const pendingOrganisationsLoading = createSelector(
  getPendingOrgs,
  state => state.loading
);


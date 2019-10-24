import { createSelector } from '@ngrx/store';
import { getRootApproveOrgState } from '../reducers';
import * as fromOrganisation from '../reducers/org-pending.reducer';

export const getPendingOrgs = createSelector(
    getRootApproveOrgState,
    state => state.pendingOrganisations
);

export const pendingOrganisations = createSelector( getPendingOrgs, fromOrganisation.getPendingOrganisations);
export const reviewedOrganisations = createSelector(
  getPendingOrgs,
  fromOrganisation.getReviewedOrganisations
);

export const errorOganisations = createSelector( getPendingOrgs, fromOrganisation.getErrorMessage);

export const pendingOrganisationsCount = createSelector(
  getPendingOrgs,
  (orgArr) =>  orgArr ? orgArr.pendingOrganisations.length : 0
);

export const pendingOrganisationsLoading = createSelector(
  getPendingOrgs,
  state => state.loading
);


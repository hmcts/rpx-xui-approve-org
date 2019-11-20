// import * as fromOrganisation from '../reducers/org-pending.reducer';
// import { createSelector } from '@ngrx/store';
// import {getRootApproveOrgState} from '../reducers';
//
// export const getPendingOrgs = createSelector(
//     getRootApproveOrgState,
//     state => state.organisations
// );
//
// export const pendingOrganisations = createSelector( getPendingOrgs, fromOrganisation.getPendingOrganisations);
// export const orgForReview = createSelector(
//   getPendingOrgs,
//   fromOrganisation.getReviewedOrganisations
// );
//
// export const errorOrganisations = createSelector( getPendingOrgs, fromOrganisation.getErrorMessage);
//
// export const pendingOrganisationsCount = createSelector(
//   getPendingOrgs,
//   (orgArr) =>  orgArr ? orgArr.pendingOrganisations.length : 0
// );
//
// export const pendingOrganisationsLoading = createSelector(
//   getPendingOrgs,
//   state => state.loading
// );
//

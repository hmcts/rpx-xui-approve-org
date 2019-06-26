import { createSelector } from '@ngrx/store';
import * as fromFeature from '../reducers';
import * as fromSingleOrg from '../reducers/single-org-pending.reducer';
import * as fromRoot from '../../../app/store';

export const getSinglePendingOrgState = createSelector(
  fromFeature.getRootOrganisationsState,
  (state: fromFeature.OrganisationState) => state.singleOrgPending
);

export const getSinglePendingOrgOverview = createSelector(
  getSinglePendingOrgState,
  fromSingleOrg.getSingleOrgOverview
);

export const getCurrentPendingPage = createSelector(
  fromRoot.getRouterState,
  (router) => router.state.params
);

export const orgSummaryPendingLoading = createSelector(getSinglePendingOrgState, fromSingleOrg.getSingleOrgOverviewLoading);
export const orgSummaryPendingLoaded = createSelector(getSinglePendingOrgState, fromSingleOrg.getSingleOrgOverviewLoaded);


